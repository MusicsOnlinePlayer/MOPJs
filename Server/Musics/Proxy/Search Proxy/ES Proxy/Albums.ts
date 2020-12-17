import { IAlbum } from '../../../Interfaces';

import { Album } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';

const LogLocation = 'Musics.Proxy.Search.ESProxy.Albums';

// eslint-disable-next-line import/prefer-default-export
export const EsAlbumSearch = (
	Query: string,
) : Promise<IAlbum[]> => new Promise((resolve, reject) => {
	Album.search(
		{
			simple_query_string: {
				query: `${Query}*`,
				fields: [
					'Name^5',
				],
				default_operator: 'and',
			},
		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				MopConsole.error(LogLocation, err.message);
			}
			const ClientResults : IAlbum[] = [];

			if (!result) {
				MopConsole.error(LogLocation, 'Request error !');
				reject(new Error('Request Error'));
				return;
			}

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			resolve(ClientResults);
		},
	);
});
