const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');
const { CheckIfDeezerReqAreAllowed } = require('./Misc');

const LogLocation = 'Musics.Proxy.DeezerProxy.Playlist';

module.exports = {
	/** This function gets all musics of a specified playlist from deezer API.
	 * @param {number} PlaylistId - Playlist deezer id from deezer API.
	 * @returns {object[]} Data from deezer API, not formatted for a usage in MongoDB
	 */
	GetMusicsOfPlaylist: (PlaylistId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting musics of playlist with deezer id ${PlaylistId}`);
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get(`https://api.deezer.com/playlist/${PlaylistId}/tracks`)
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
