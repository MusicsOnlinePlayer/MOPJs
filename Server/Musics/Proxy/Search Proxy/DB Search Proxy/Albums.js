const { Album } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Albums';

const DBAlbumSearch = (Query) => new Promise((resolve, reject) => {
	Album
		.find({ $text: { $search: Query } })
		.limit(8)
		.populate('MusicsId')
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
	DBAlbumSearch,
};
