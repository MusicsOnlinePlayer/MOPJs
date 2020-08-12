const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');
const { CheckIfDeezerReqAreAllowed } = require('./Misc');

const LogLocation = 'Musics.Proxy.DeezerProxy.Search';

module.exports = {
	/** This function gets all musics from deezer API matching a query.
	 * @param {string} Query - The actual query sent to Deezer API
	 * @returns {object[]} Data from deezer API, not formatted for a usage in MongoDB
	 */
	SearchMusics: (Query) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin search for query ${Query}`);
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get(`https://api.deezer.com/search?q=${Query}`)
			.then(async (res) => {
				MopConsole.debug(LogLocation, `Found ${res.data.data.length} musics`);
				resolve(res.data.data);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	}),
};
