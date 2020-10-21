const { Playlist } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Playlists';

const DBPlaylistSearch = (Query) => new Promise((resolve, reject) => {
	Playlist
		.find({ $text: { $search: Query }, IsPublic: true })
		.limit(8)
		.populate({
			path: 'MusicsId',
			populate: {
				path: 'AlbumId',
				model: 'Album',
			},
		})
		.exec(
			(err, result) => {
				if (err) {
					MopConsole.error(LogLocation, err);
					return;
				}

				if (!result) {
					MopConsole.error(LogLocation, 'Request error !');
					reject(new Error('Request Error'));
					return;
				}
				resolve(result);
			},
		);
});


module.exports = {
	DBPlaylistSearch,
};
