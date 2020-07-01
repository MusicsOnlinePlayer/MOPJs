const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.DeezerProxy.Musics';

module.exports = {
	GetMusicOfAlbum: (AlbumDzId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin request of musics from album with Deezer id ${AlbumDzId}`);
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				const MusicsOfAlbums = [];
				MusicsOfAlbums.push(res.data.data);
				MopConsole.debug(LogLocation, `Received ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);

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
				MopConsole.debug(LogLocation, `Received a total of ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);
				resolve(MusicsOfAlbums);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	}),
};
