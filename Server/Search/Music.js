const { Music, Album, Artist } = require('../Database/Models');
const MopConsole = require('../Tools/MopConsole');

module.exports = {
	SearchMusic: (Query) => new Promise((resolve, reject) => {
		Music.search(
			{
				multi_match: {
					query: Query,
					fields: ['Title', 'Artist^2', 'Album^0.5'],
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
				multi_match: {
					query: Query,
					fields: ['Name'],
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
				multi_match: {
					query: Query,
					fields: ['Name'],
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
