const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.DeezerProxy.Artist';

module.exports = {
	/** This function gets a file path (from Deezer API) of a specified artist image.
	 * Correspond to 'picture_big'.
	 * @param {number} ArtistDzId - The deezer Id of the artist
	 * @returns {string} File path from the Deezer API of the Artist Image
	 */
	GetImageOfArtist: (ArtistDzId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin requesting image of artist with Deezer id ${ArtistDzId}`);
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
			.then(async (res) => {
				const dzRes = res.data;
				MopConsole.debug(LogLocation, `Found an image of artist with Deezer id ${ArtistDzId}`);
				resolve(dzRes.picture_big);
			})
			.catch((err) => {
				MopConsole.error('Artist.Deezer.API', err);
				reject();
			});
	}),
};
