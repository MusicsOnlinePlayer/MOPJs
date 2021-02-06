import Axios from 'axios';
import MopConsole from 'lib/MopConsole';
import { IDeezerAlbum } from 'lib/Types/Deezer';

const LogLocation = 'Services.DeezerImporter.DeezerApi';

/** This function gets a file path (from Deezer API) of a specified artist image.
 * Correspond to 'picture_big'.
 * @param {number} ArtistDzId - The deezer Id of the artist
 * @returns {Promise<string>} File path from the Deezer API of the Artist Image
 */
export const GetDeezerArtistImage = (ArtistDzId: number): Promise<string> =>
	new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting artist image (id: ${ArtistDzId})`);
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
			.then(async (res) => {
				const dzRes = res.data;
				MopConsole.debug(LogLocation, `Got artist image (id: ${ArtistDzId})`);
				resolve(dzRes.picture_big);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject(err);
			});
	});

/** This function gets all albums of a specified Artist (here by a deezer id)
 * @param {number} ArtistDzId - The deezer Id of the artist
 * @returns {Promise<Array<IDeezerAlbum>>}Data from deezer API, not formatted for a usage in MongoDB
 */
export const GetDeezerArtistAlbums = (ArtistDzId: number): Promise<Array<IDeezerAlbum>> =>
	new Promise<Array<IDeezerAlbum>>((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting Album of artist (id: ${ArtistDzId})`);
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
			.then(async (res) => {
				const MusicsOfAlbums: Array<IDeezerAlbum> = [];
				MusicsOfAlbums.push(...res.data.data);
				MopConsole.debug(
					LogLocation,
					`Got ${MusicsOfAlbums.length} albums for artist with (id: ${ArtistDzId})`
				);

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
					`Got a total of ${MusicsOfAlbums.length} albums for artist (id: ${ArtistDzId})`
				);
				resolve(MusicsOfAlbums);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	});
