import { Artist } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';
import { IArtist } from '../../../Interfaces';

const LogLocation = 'Musics.Proxy.Search.ESProxy.Artists';

// eslint-disable-next-line import/prefer-default-export
export const EsArtistSearch = (
	Query: string,
) : Promise<IArtist[]> => new Promise((resolve, reject) => {
	Artist.search(
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
			const ClientResults : IArtist[] = [];

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
