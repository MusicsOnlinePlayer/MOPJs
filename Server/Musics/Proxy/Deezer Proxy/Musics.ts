import Axios from 'axios';
import MopConsole from '../../../Tools/MopConsole';
import { IDeezerMusic } from '../../Interfaces';
import { CheckIfDeezerReqAreAllowed } from './Misc';

const LogLocation = 'Musics.Proxy.DeezerProxy.Musics';

/** This function gets all musics of a specified album (here by a deezer id)
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
export const GetMusicOfAlbum = (AlbumDzId : number) : Promise<Array<IDeezerMusic>> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin request of musics from album with Deezer id ${AlbumDzId}`);
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
			.then(async (res) => {
				const MusicsOfAlbums = [];
				MusicsOfAlbums.push(...res.data.data);
				MopConsole.debug(LogLocation, `Received ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);

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
				MopConsole.debug(LogLocation, `Received a total of ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);
				resolve(MusicsOfAlbums);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	},
);
