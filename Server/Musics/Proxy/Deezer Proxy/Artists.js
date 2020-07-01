const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.DeezerProxy.Artist';

module.exports = {
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
