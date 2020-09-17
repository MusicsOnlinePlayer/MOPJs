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
				const MusicsOfPlaylist = [];
				let ReqCount = 1;
				MusicsOfPlaylist.push(...res.data.data);
				MopConsole.debug(LogLocation, `Found ${res.data.data.length} musics ${ReqCount}`);

				let NextUrl = res.data.next;
				while (NextUrl) {
					let nextRes;
					try {
						nextRes = await Axios.get(NextUrl);
						ReqCount += 1;
						MusicsOfPlaylist.push(...nextRes.data.data);
						MopConsole.debug(LogLocation, `Found ${nextRes.data.data.length} musics ${ReqCount}`);
					} catch (handlerErr) {
						MopConsole.error(LogLocation, handlerErr);
					}
					NextUrl = nextRes.data ? nextRes.data.next : undefined;
				}

				resolve(MusicsOfPlaylist);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	}),
};
