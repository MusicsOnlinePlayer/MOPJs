import Axios from 'axios';
import MopConsole from 'lib/MopConsole';
import { IDeezerMusic } from 'lib/Types/Deezer';

const LogLocation = 'Services.DeezerImporter.DeezerApi';

/** This function gets a file path (from Deezer API) of a specified album cover.
 * Correspond to 'cover_big'.
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {string} File path from the Deezer API of the cover
 */
export const GetDeezerAlbumCover = (AlbumDzId: number): Promise<string> =>
	new Promise<string>((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting album cover (id: ${AlbumDzId})`);
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}`)
			.then((res) => {
				const dzRes = res.data;
				MopConsole.debug(LogLocation, `Got album cover (id: ${AlbumDzId})`);
				resolve(dzRes.cover_big);
			})
			.catch((err) => {
				MopConsole.error('Album.Deezer.API', err);
				reject();
			});
	});

/** This function gets all musics of a specified album (here by a deezer id)
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
export const GetDeezerAlbumMusics = (AlbumDzId: number): Promise<Array<IDeezerMusic>> =>
	new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting album musics (id: ${AlbumDzId})`);
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				const MusicsOfAlbums = [];
				MusicsOfAlbums.push(...res.data.data);
				MopConsole.debug(LogLocation, `Got ${MusicsOfAlbums.length} musics for album (id: ${AlbumDzId})`);

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
				MopConsole.debug(
					LogLocation,
					`Got a total of ${MusicsOfAlbums.length} musics for album (id: ${AlbumDzId})`
				);
				resolve(MusicsOfAlbums);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	});