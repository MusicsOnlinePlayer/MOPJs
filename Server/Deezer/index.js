const Axios = require('axios').default;
const { HandleNewMusicFromDz } = require('../Database/MusicReader/MusicReader');

module.exports = {
	AddSearchToDb: (query) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/search?q=${query}`)
			.then(async (res) => {
				const dzRes = res.data.data;
				/* eslint no-restricted-syntax: "off" */
				for (const dzTrack of dzRes) {
					await HandleNewMusicFromDz(dzTrack);
				}
				resolve();
			})
			.catch((err) => {
				console.log(err);
				reject();
			});
	}),
};
