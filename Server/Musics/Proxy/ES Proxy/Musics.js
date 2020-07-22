const { Music } = require('../../Model');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.ESProxy.Musics';

const EsMusicSearch = (Query) => new Promise((resolve, reject) => {
	Music.search(
		{
			function_score: {
				query: {
					simple_query_string: {
						query: `${Query}*`,
						fields: [
							'Title^5',
							'Album^2',
							'Artist^2',
						],
						default_operator: 'and',
					},
				},
				field_value_factor: {
					field: 'Views',
					factor: 2,
					modifier: 'sqrt',
					missing: 1,
				},
			},

		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				MopConsole.error(LogLocation, err);
				return;
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
	EsMusicSearch,
};
