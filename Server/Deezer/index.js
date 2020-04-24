const Axios = require('axios').default;
const { HandleNewMusic } = require('../Database/MusicReader/MusicReader');

module.exports = {
	AddSearchToDb: (query) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/search?q=${query}`)
			.then(async (res) => {
				const dzRes = res.data.data;
				/* eslint no-restricted-syntax: "off" */
				for (const dzTrack of dzRes) {
					await HandleNewMusic({
						title: dzTrack.title,
						album: dzTrack.album.title,
						artist: [dzTrack.artist.name],
						track: { no: 0 },
						picture: [dzTrack.album.cover_big],
					}, undefined, true, dzTrack.id, dzTrack.artist.picture_big);
				}
				resolve();
			})
			.catch((err) => {
				console.log(err);
				reject();
			});
	}),
};
