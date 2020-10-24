const { Album } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Albums';

const DBAlbumSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
	Album
		.find({ $text: { $search: Query } })
		.limit(PerPage)
		.skip(Page * PerPage)
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
