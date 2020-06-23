const { Music, Album, Artist } = require('../Database/Models');
const MopConsole = require('../Tools/MopConsole');

module.exports = {
	SearchMusic: (Query) => new Promise((resolve, reject) => {
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
					MopConsole.error('Music.Search.Elastic', err);
					return;
				}
				const ClientResults = [];

				if (!result) {
					MopConsole.error('Music.Search.Elastic', 'Request error !');
					reject(new Error('Request Error'));
					return;
				}


				result.hits.hits.map((hit) => {
					ClientResults.push(hit._id);
				});
				resolve(ClientResults);
			},
		);
	}),
	SearchAlbum: (Query) => new Promise((resolve, reject) => {
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
					MopConsole.error('Album.Search.Elastic', err);
				}
				const ClientResults = [];

				if (!result) {
					MopConsole.error('Album.Search.Elastic', 'Request error !');
					reject(new Error('Request Error'));
					return;
				}

				result.hits.hits.map((hit) => {
					ClientResults.push(hit._id);
				});
				resolve(ClientResults);
			},
		);
	}),

	SearchArtist: (Query) => new Promise((resolve, reject) => {
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
					MopConsole.error('Artist.Search.Elastic', err);
				}
				const ClientResults = [];

				if (!result) {
					MopConsole.error('Artist.Search.Elastic', 'Request error !');
					reject(new Error('Request Error'));
					return;
				}

				result.hits.hits.map((hit) => {
					ClientResults.push(hit._id);
				});
				resolve(ClientResults);
			},
		);
	}),
};
