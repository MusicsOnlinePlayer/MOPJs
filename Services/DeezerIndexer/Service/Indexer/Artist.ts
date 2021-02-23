import { Artist, IArtist } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';
import { IDeezerAlbum, IDeezerArtist } from 'lib/Types/Deezer';
import { ObjectId } from 'mongodb';
import { GetTagsFromDeezerSearchArtists, GetTagsFromDeezerArtistAlbums } from '../Transformer/Artist';
import { BulkInsertAlbums, BulkInsertArtists } from './Helper';

const LogLocation = 'Services.DeezerIndexer.Indexer.Artist';

export const IndexArtists = async (DeezerArtists: IDeezerArtist[]): Promise<ObjectId[]> => {
	const startTime = Date.now();
	const ImportedArtists = DeezerArtists.map((a) => GetTagsFromDeezerSearchArtists(a).ImportedArtist);

	const result = await BulkInsertArtists(ImportedArtists);

	const Duration = Date.now() - startTime;
	MopConsole.debug(LogLocation, `Indexed ${DeezerArtists.length} albums in ${Duration} ms`);

	return result.getUpsertedIds().map((r) => r._id);
};

export const IndexArtistAlbums = async (DeezerArtistId: number, DeezerAlbums: IDeezerAlbum[]): Promise<IArtist> => {
	const Import = DeezerAlbums.map((a) => GetTagsFromDeezerArtistAlbums(a));

	const result = await BulkInsertAlbums(Import.map((v) => v.ImportedAlbum));
	const AlbumIds = result.getUpsertedIds().map((k) => new ObjectId(k._id));

	MopConsole.info(LogLocation, `Upserted ${AlbumIds.length} albums`);
	await Artist.updateOne(
		{ DeezerId: DeezerArtistId },
		{
			$push: { AlbumsId: { $each: AlbumIds } },
		}
	);

	return await Artist.findOne({ DeezerId: DeezerArtistId })
		.populate({
			path: 'AlbumsId',
			populate: {
				path: 'MusicsId',
				model: 'Music',
			},
		})
		.exec();
};
