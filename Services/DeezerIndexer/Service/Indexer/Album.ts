import { IDeezerAlbum, IDeezerMusic } from 'lib/Types/Deezer';
import { IMusicModel, Music, Album, IMusic, IAlbum } from 'lib/Models/Musics';
import { GetTagsFromDeezerAlbumMusics } from '../Transformer/Music';
import { BulkWriteOperation, ObjectId } from 'mongodb';
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
