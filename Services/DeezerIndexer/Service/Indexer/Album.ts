import { IDeezerAlbum, IDeezerMusic } from 'lib/Types/Deezer';
import { IMusicModel, Music, Album, IMusic } from 'lib/Models/Musics';
import { GetTagsFromDeezerAlbumMusics } from 'Service/Transformer/Music';
import { BulkWriteOperation, ObjectId } from 'mongodb';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.DeezerIndexer.Indexer.Album';

const IndexAlbumMusics = async (DeezerAlbum: IDeezerAlbum, DeezerMusics: IDeezerMusic[]) => {
	const ExportedMusics = DeezerMusics.map((m) => GetTagsFromDeezerAlbumMusics(m, DeezerAlbum.title, DeezerAlbum.id));

	const AlbumFromDb = await Album.find({ DeezerId: DeezerAlbum.id });

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
};
