const Axios = require('axios').default;
const MopConsole = require('../Tools/MopConsole');
const {
	HandleNewMusicFromDz, HandleMusicsFromDz, HandleAlbumsFromDz, HandleNewCoverFromDz,
	HandleNewImageFromDz,
} = require('../Database/MusicReader');

async function AddMusicOfAlbum(res, AlbumName, AlbumDzId, AlbumCoverPath) {
	const dzRes = res.data.data;
	MopConsole.info('Deezer - API', `Found ${dzRes.length} musics for this album`);
	await HandleMusicsFromDz(dzRes, AlbumName, AlbumDzId, AlbumCoverPath);
}

async function AddAlbumofArtist(res, ArtistDzId) {
	const dzRes = res.data.data;
	MopConsole.info('Deezer - API', `Found ${dzRes.length} albums for this artist`);
	await HandleAlbumsFromDz(ArtistDzId, dzRes);
}


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
				MopConsole.error('Deezer - API', err);
				reject();
			});
	}),

	AddMusicOfAlbumToDb: (AlbumDzId, AlbumName, AlbumCoverPath) => new Promise((resolve, reject) => {
		if (!AlbumCoverPath) {
			MopConsole.warn('Deezer - API', `Provided empty cover for album ${AlbumName} - Deezer id ${AlbumDzId}`);
		}
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				await AddMusicOfAlbum(res, AlbumName, AlbumDzId, AlbumCoverPath);
				let nextUrl = res.data.next;

				while (nextUrl) {
					const nextRes = await Axios.get(nextUrl);
					await AddMusicOfAlbum(nextRes, AlbumName, AlbumDzId, AlbumCoverPath);
					nextUrl = nextRes.data.next;
				}

				resolve();
			})
			.catch((err) => {
				MopConsole.error('Deezer - API', err);
				reject();
			});
	}),

	AddAlbumOfArtistToDb: (ArtistDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				await AddAlbumofArtist(res, ArtistDzId);

				let nextUrl = res.data.next;

				while (nextUrl) {
					const nextRes = await Axios.get(nextUrl);
					await AddAlbumofArtist(nextRes, ArtistDzId);
					nextUrl = nextRes.data.next;
				}


				resolve();
			})
			.catch((err) => {
				MopConsole.error('Deezer - API', err);
				reject();
			});
	}),

	AddCoverOfAlbumToDb: (AlbumDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}`)
			.then(async (res) => {
				const dzRes = res.data;
				await HandleNewCoverFromDz(AlbumDzId, dzRes);
				resolve(dzRes.cover_big);
			})
			.catch((err) => {
				MopConsole.error('Deezer - API', err);
				reject();
			});
	}),

	AddImageOfArtistToDb: (ArtistDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
			.then(async (res) => {
				const dzRes = res.data;
				await HandleNewImageFromDz(ArtistDzId, dzRes);
				resolve(dzRes.picture_big);
			})
			.catch((err) => {
				MopConsole.error('Deezer - API', err);
				reject();
			});
	}),
};
