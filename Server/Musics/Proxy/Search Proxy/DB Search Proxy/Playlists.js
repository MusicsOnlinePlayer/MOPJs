const { Playlist } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Playlists';

const DBPlaylistSearch = (Query) => new Promise((resolve, reject) => {
	Playlist
		.find({ $text: { $search: Query }, IsPublic: true })
		.limit(8)
		.exec(
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


				result.map((doc) => {
					ClientResults.push(doc._id);
				});
				resolve(ClientResults);
			},
		);
});


module.exports = {
	DBPlaylistSearch,
};
