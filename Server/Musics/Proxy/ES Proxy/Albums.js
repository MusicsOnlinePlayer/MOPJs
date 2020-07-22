const { Album } = require('../../Model');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.ESProxy.Musics';

const EsAlbumSearch = (Query) => new Promise((resolve, reject) => {
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
	EsAlbumSearch,
};
