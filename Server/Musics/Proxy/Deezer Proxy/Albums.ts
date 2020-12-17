import Axios from 'axios';
import MopConsole from '../../../Tools/MopConsole';
import { IDeezerAlbum } from '../../Interfaces';
import { CheckIfDeezerReqAreAllowed } from './Misc';

const LogLocation = 'Musics.Proxy.DeezerProxy.Albums';

/** This function gets all albums of a specified Artist (here by a deezer id)
 * @param {number} ArtistDzId - The deezer Id of the artist
 * @returns {Promise<Array<IDeezerAlbum>>}Data from deezer API, not formatted for a usage in MongoDB
 */
export const GetAlbumsOfArtist = (ArtistDzId: number):
Promise<Array<IDeezerAlbum>> => new Promise<Array<IDeezerAlbum>>(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin request of albums from artist with Deezer id ${ArtistDzId}`);
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				const MusicsOfAlbums: Array<IDeezerAlbum> = [];
				MusicsOfAlbums.push(...res.data.data);
				MopConsole.debug(LogLocation, `Received ${MusicsOfAlbums.length} albums for artist with Deezer id ${ArtistDzId}`);

				let nextUrl = res.data.next;

				while (nextUrl) {
					let nextRes;
					try {
						nextRes = await Axios.get(nextUrl);
						MusicsOfAlbums.push(...nextRes.data.data);
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
	},
);

/** This function gets a file path (from Deezer API) of a specified album cover.
 * Correspond to 'cover_big'.
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {string} File path from the Deezer API of the cover
 */
export const GetCoverPathOfAlbum = (AlbumDzId: number) : Promise<string> => new Promise<string>(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin requesting cover of album with Deezer id ${AlbumDzId}`);
		if (CheckIfDeezerReqAreAllowed()) resolve('');
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
	},
);
