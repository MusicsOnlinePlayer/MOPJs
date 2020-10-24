const { Artist } = require('../../../Model');
const MopConsole = require('../../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.Search.DBSearch.Artists';

const DBArtistSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
	Artist
		.find({ $text: { $search: Query } })
		.limit(PerPage)
		.skip(Page * PerPage)
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
	DBArtistSearch,
};
