const Axios = require('axios').default;
const { HandleNewMusicFromDz, HandleMusicsFromDz, HandleAlbumsFromDz } = require('../Database/MusicReader');


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

	AddMusicOfAlbumToDb: (AlbumDzId, AlbumName, AlbumCoverPath) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				const dzRes = res.data.data;
				await HandleMusicsFromDz(dzRes, AlbumName, AlbumDzId, AlbumCoverPath);
				resolve();
			})
			.catch((err) => {
				console.log(err);
				reject();
			});
	}),

	AddAlbumOfArtistToDb: (ArtistDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				const dzRes = res.data.data;
				HandleAlbumsFromDz(ArtistDzId, dzRes);
				resolve();
			})
			.catch((err) => {
				console.log(err);
				reject();
			});
	}),
};
