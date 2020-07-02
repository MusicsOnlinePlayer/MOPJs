const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.DeezerProxy.Albums';

module.exports = {
	GetAlbumsOfArtist: (ArtistDzId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin request of albums from artist with Deezer id ${ArtistDzId}`);
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				const MusicsOfAlbums = [];
				MusicsOfAlbums.push(res.data.data);
				MopConsole.debug(LogLocation, `Received ${MusicsOfAlbums.length} albums for artist with Deezer id ${ArtistDzId}`);

				let nextUrl = res.data.next;

				while (nextUrl) {
					let nextRes;
					try {
						nextRes = await Axios.get(nextUrl);
						MusicsOfAlbums.push(nextRes.data.data);
					} catch (handlerErr) {
						MopConsole.error(LogLocation, handlerErr);
					}
					nextUrl = nextRes.data ? nextRes.data.next : undefined;
				}
				MopConsole.debug(LogLocation, `Received a total of ${MusicsOfAlbums.length} albums for artist with Deezer id ${ArtistDzId}`);
				resolve(MusicsOfAlbums);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	}),
	GetCoverPathOfAlbum: (AlbumDzId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin requesting cover of album with Deezer id ${AlbumDzId}`);
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}`)
			.then((res) => {
				const dzRes = res.data;
				MopConsole.debug(LogLocation, `Found a cover of album with Deezer id ${AlbumDzId}`);
				resolve(dzRes.cover_big);
			})
			.catch((err) => {
				MopConsole.error('Album.Deezer.API', err);
				reject();
			});
	}),
};
