const Axios = require('axios').default;
const MopConsole = require('../Tools/MopConsole');
const {
	HandleNewMusicFromDz, HandleMusicsFromDz, HandleAlbumsFromDz, HandleNewCoverFromDz,
	HandleNewImageFromDz,
} = require('../Database/MusicReader');

async function AddMusicOfAlbum(res, AlbumName, AlbumDzId, AlbumCoverPath) {
	const dzRes = res.data.data;
	MopConsole.info('Music.Deezer.API', `Found ${dzRes.length} musics for this album`);
	await HandleMusicsFromDz(dzRes, AlbumName, AlbumDzId, AlbumCoverPath);
}

async function AddAlbumofArtist(res, ArtistDzId) {
	const dzRes = res.data.data;
	MopConsole.info('Album.Deezer.API', `Found ${dzRes.length} albums for this artist`);
	await HandleAlbumsFromDz(ArtistDzId, dzRes);
}


module.exports = {
	AddSearchToDb: (query) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/search?q=${query}`)
			.then(async (res) => {
				const dzRes = res.data.data;
				/* eslint no-restricted-syntax: "off" */
				for (const dzTrack of dzRes) {
					try {
						await HandleNewMusicFromDz(dzTrack);
					} catch (handlerErr) {
						MopConsole.error('Music.Deezer.API', handlerErr);
					}
				}
				resolve();
			})
			.catch((err) => {
				MopConsole.error('Music.Deezer.API', err);
				reject();
			});
	}),

	AddMusicOfAlbumToDb: (AlbumDzId, AlbumName, AlbumCoverPath) => new Promise((resolve, reject) => {
		if (!AlbumCoverPath) {
			MopConsole.warn('Album.Deezer.API', `Provided empty cover for album ${AlbumName} - Deezer id ${AlbumDzId}`);
		}
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				try {
					await AddMusicOfAlbum(res, AlbumName, AlbumDzId, AlbumCoverPath);
				} catch (handlerErr) {
					MopConsole.error('Album.Deezer.API', handlerErr);
				}
				let nextUrl = res.data.next;

				while (nextUrl) {
					let nextRes;
					try {
						nextRes = await Axios.get(nextUrl);
						await AddMusicOfAlbum(nextRes, AlbumName, AlbumDzId, AlbumCoverPath);
					} catch (handlerErr) {
						MopConsole.error('Album.Deezer.API', handlerErr);
					}

					nextUrl = nextRes.data ? nextRes.data.next : undefined;
				}

				resolve();
			})
			.catch((err) => {
				MopConsole.error('Album.Deezer.API', err);
				reject();
			});
	}),

	AddAlbumOfArtistToDb: (ArtistDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				try {
					await AddAlbumofArtist(res, ArtistDzId);
				} catch (handlerErr) {
					MopConsole.error('Artist.Deezer.API', handlerErr);
				}
				let nextUrl = res.data.next;

				while (nextUrl) {
					let nextRes;

					try {
						nextRes = await Axios.get(nextUrl);
						await AddAlbumofArtist(nextRes, ArtistDzId);
					} catch (handlerErr) {
						MopConsole.error('Artist.Deezer.API', handlerErr);
					}
					nextUrl = nextRes.data ? nextRes.data.next : undefined;
				}


				resolve();
			})
			.catch((err) => {
				MopConsole.error('Artist.Deezer.API', err);
				reject();
			});
	}),

	AddCoverOfAlbumToDb: (AlbumDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}`)
			.then(async (res) => {
				const dzRes = res.data;
				try {
					await HandleNewCoverFromDz(AlbumDzId, dzRes);
				} catch (handlerErr) {
					MopConsole.error('Album.Deezer.API', handlerErr);
				}
				resolve(dzRes.cover_big);
			})
			.catch((err) => {
				MopConsole.error('Album.Deezer.API', err);
				reject();
			});
	}),

	AddImageOfArtistToDb: (ArtistDzId) => new Promise((resolve, reject) => {
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
			.then(async (res) => {
				const dzRes = res.data;
				try {
					await HandleNewImageFromDz(ArtistDzId, dzRes);
				} catch (handlerErr) {
					MopConsole.error('Artist.Deezer.API', handlerErr);
				}
				resolve(dzRes.picture_big);
			})
			.catch((err) => {
				MopConsole.error('Artist.Deezer.API', err);
				reject();
			});
	}),
};
