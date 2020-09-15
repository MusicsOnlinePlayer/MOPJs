const { Playlist } = require('../../Model');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.ESProxy.Playlists';

const EsPlaylistSearch = (Query) => new Promise((resolve, reject) => {
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
				MopConsole.error(LogLocation, err);
			}
			const ClientResults = [];

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


module.exports = {
	EsPlaylistSearch,
};
