import { IDeezerMusic } from 'lib/Types/Deezer';
import { Album, Artist, Music } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';
import { GetTagsFromDeezerSearchMusics } from '../Transformer/Music';
import { ObjectId } from 'mongodb';
import { BulkInsertAlbums, BulkInsertArtists, BulkInsertMusics } from './Helper';

const LogLocation = 'Services.DeezerIndexer.Indexer.Music';

export const IndexDeezerMusics = async (DeezerMusics: IDeezerMusic[]): Promise<ObjectId[]> => {
	const startTime = Date.now();
	MopConsole.debug(LogLocation, `Indexing ${DeezerMusics.length} musics`);

	const ParsedEntries = DeezerMusics.map((m) => GetTagsFromDeezerSearchMusics(m));
	const ParsedAlbums = ParsedEntries.map((m) => m.ImportedAlbum);

	// Inserting all musics only if it doesn't exists (by DeezerId)

	const BulkMusicInsert = await BulkInsertMusics(ParsedEntries.map((m) => m.ImportedMusic));
	await BulkInsertAlbums(ParsedEntries.map((m) => m.ImportedAlbum));
	await BulkInsertArtists(ParsedEntries.map((m) => m.ImportedArtist));

	const AddedMusics = await Music.find({
		_id: {
			$in: BulkMusicInsert.getUpsertedIds().map((k) => new ObjectId(k._id)),
		},
	});

	if (AddedMusics.length !== 0) {
		const UpdateMusicsBulk = Music.collection.initializeUnorderedBulkOp();
		const UpdateAlbumsBulk = Album.collection.initializeUnorderedBulkOp();
		const UpdateArtistsBulk = Artist.collection.initializeUnorderedBulkOp();

		const CorrespondingAlbums = await Album.find({
			DeezerId: { $in: ParsedAlbums.map((a) => a.DeezerId) },
		});
		AddedMusics.forEach((AddedMusic) => {
			const CorrespondingImportedEntry = ParsedEntries.find(
				(e) => e.ImportedMusic.DeezerId === AddedMusic.DeezerId
			);
			const CorrespondingAlbum = CorrespondingAlbums.find(
				(a) => a.DeezerId === CorrespondingImportedEntry.ImportedAlbum.DeezerId
			);
			UpdateMusicsBulk.find({ DeezerId: AddedMusic.DeezerId }).updateOne({
				$set: { AlbumId: CorrespondingAlbum._id },
			});
			UpdateAlbumsBulk.find({ _id: CorrespondingAlbum._id }).updateOne({
				$addToSet: { MusicsId: AddedMusic._id },
			});
			UpdateArtistsBulk.find({ Name: CorrespondingImportedEntry.ImportedArtist.Name }).updateOne({
				$addToSet: { AlbumsId: CorrespondingAlbum._id },
			});
		});

		const UpdateMusicsBulkResult = await UpdateMusicsBulk.execute();
		const UpdateAlbumsBulkResult = await UpdateAlbumsBulk.execute();
		const UpdateArtistsBulkResult = await UpdateArtistsBulk.execute();

		MopConsole.debug(LogLocation, `Updated ${UpdateMusicsBulkResult.nModified} musics`);
		MopConsole.debug(LogLocation, `Updated ${UpdateAlbumsBulkResult.nModified} albums`);
		MopConsole.debug(LogLocation, `Updated ${UpdateArtistsBulkResult.nModified} artists`);

		const Duration = Date.now() - startTime;
		MopConsole.debug(LogLocation, `Indexed ${AddedMusics.length} musics in ${Duration} ms`);
	}

	return BulkMusicInsert.getUpsertedIds().map((r) => r._id);
};
