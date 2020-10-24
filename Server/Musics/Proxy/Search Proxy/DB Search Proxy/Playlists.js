const { Playlist } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Playlists';

const DBPlaylistSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
	Playlist
		.find({ $text: { $search: Query }, IsPublic: true })
		.limit(PerPage)
		.skip(Page * PerPage)
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
