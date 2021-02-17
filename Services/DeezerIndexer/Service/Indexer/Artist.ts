import MopConsole from 'lib/MopConsole';
import { IDeezerArtist } from 'lib/Types/Deezer';
import { ObjectId } from 'mongodb';
import { GetTagsFromDeezerSearchArtists } from '../Transformer/Artist';
import { BulkInsertArtists } from './Helper';

const LogLocation = 'Services.DeezerIndexer.Indexer.Artist';

export const IndexArtists = async (DeezerArtists: IDeezerArtist[]): Promise<ObjectId[]> => {
	const startTime = Date.now();
	const ImportedArtists = DeezerArtists.map((a) => GetTagsFromDeezerSearchArtists(a).ImportedArtist);

	const result = await BulkInsertArtists(ImportedArtists);

	const Duration = Date.now() - startTime;
	MopConsole.debug(LogLocation, `Indexed ${DeezerArtists.length} albums in ${Duration} ms`);

	return result.getUpsertedIds().map((r) => r._id);
};
