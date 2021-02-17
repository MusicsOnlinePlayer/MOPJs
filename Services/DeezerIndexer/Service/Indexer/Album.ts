import { IDeezerAlbum, IDeezerMusic } from 'lib/Types/Deezer';
import { IMusicModel, Music, Album, IMusic, IAlbum, Artist } from 'lib/Models/Musics';
import { GetTagsFromDeezerAlbumMusics } from '../Transformer/Music';
import { GetTagsFromDeezerSearchAlbums } from '../Transformer/Album';
import { BulkWriteOperation, ObjectId } from 'mongodb';
import { BulkInsertAlbums, BulkInsertArtists } from './Helper';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.DeezerIndexer.Indexer.Album';

export const IndexAlbumMusics = async (DeezerAlbumId: number, DeezerMusics: IDeezerMusic[]): Promise<IAlbum> => {
	const AlbumFromDb = await Album.findOne({ DeezerId: DeezerAlbumId });

	const ExportedMusics = DeezerMusics.map((m) => GetTagsFromDeezerAlbumMusics(m, AlbumFromDb.Name, DeezerAlbumId));

	const MusicsToAdd = ExportedMusics.map(
		(i) =>
			<IMusic>{
				...i.ImportedMusic,
				AlbumId: AlbumFromDb._id,
			}
	);
	const bulkArr: BulkWriteOperation<IMusicModel>[] = [];
	MusicsToAdd.forEach((MusicToAdd) => {
		bulkArr.push({
			updateOne: {
				filter: {
					DeezerId: MusicToAdd.DeezerId,
				},
				update: {
					$set: Music,
				},
				upsert: true,
			},
		});
	});
	const MusicsInsertResult = await Music.collection.bulkWrite(bulkArr);
	const MusicIds = Object.keys(MusicsInsertResult.upsertedIds);
	MopConsole.info(LogLocation, `Upserted ${MusicIds.length} musics`);

	AlbumFromDb.MusicsId.push(...MusicIds.map((id) => new ObjectId(id)));
	return await AlbumFromDb.save();
};

export const SetDeezerCoverOfAlbum = async (DeezerAlbumId: number, path: string): Promise<IAlbum> => {
	const AlbumFromDb = await Album.findOne({ DeezerId: DeezerAlbumId });
	AlbumFromDb.ImagePathDeezer = path;
	return await AlbumFromDb.save();
};

export const IndexAlbums = async (DeezerAlbums: IDeezerAlbum[]): Promise<ObjectId[]> => {
	const startTime = Date.now();
	const Import = DeezerAlbums.map((a) => GetTagsFromDeezerSearchAlbums(a));

	const BulkAlbumInsert = await BulkInsertAlbums(Import.map((i) => i.ImportedAlbum));

	await BulkInsertArtists(Import.map((i) => i.ImportedArtist));

	const AddedAlbums = await Album.find({
		_id: {
			$in: BulkAlbumInsert.getUpsertedIds().map((k) => new ObjectId(k._id)),
		},
	});

	if (AddedAlbums.length !== 0) {
		const ArtistBulkUpdate = Artist.collection.initializeUnorderedBulkOp();

		AddedAlbums.forEach((album) => {
			const correspondingImport = Import.find((e) => e.ImportedAlbum.DeezerId === album.DeezerId);
			ArtistBulkUpdate.find({ Name: correspondingImport.ImportedArtist.Name }).updateOne({
				$addToSet: { AlbumsId: album._id },
			});
		});

		const UpdateArtistsBulkResult = await ArtistBulkUpdate.execute();
		MopConsole.debug(LogLocation, `Updated ${UpdateArtistsBulkResult.nModified} artists`);
	}

	const Duration = Date.now() - startTime;
	MopConsole.debug(LogLocation, `Indexed ${AddedAlbums.length} albums in ${Duration} ms`);

	return BulkAlbumInsert.getUpsertedIds().map((r) => r._id);
};
