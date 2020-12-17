import { IPlaylist } from '../../../Interfaces';

import { Playlist } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';

const LogLocation = 'Musics.Proxy.Search.ESProxy.Playlists';

// eslint-disable-next-line import/prefer-default-export
export const EsPlaylistSearch = (
	Query: string,
) : Promise<IPlaylist[]> => new Promise((resolve, reject) => {
	Playlist.search(
		{
			bool: {
				must: [
					{
						simple_query_string: {
							query: `${Query}*`,
							fields: [
								'Name^5',
							],
							default_operator: 'and',
						},
					},
				],
				must_not: [
					{
						term: {
							IsPublic: false,
						},
					},

				],
			},

		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				MopConsole.error(LogLocation, err.message);
			}
			const ClientResults : IPlaylist[] = [];

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
