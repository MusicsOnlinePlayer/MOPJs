/* eslint-disable import/prefer-default-export */
import Axios from 'axios';
import MopConsole from '../../../Tools/MopConsole';
import { CheckIfDeezerReqAreAllowed } from './Misc';

const LogLocation = 'Musics.Proxy.DeezerProxy.Artist';

/** This function gets a file path (from Deezer API) of a specified artist image.
	 * Correspond to 'picture_big'.
	 * @param {number} ArtistDzId - The deezer Id of the artist
	 * @returns {Promise<string>} File path from the Deezer API of the Artist Image
	 */
export const GetImageOfArtist = (ArtistDzId: number) : Promise<string> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin requesting image of artist with Deezer id ${ArtistDzId}`);
		if (CheckIfDeezerReqAreAllowed()) reject(new Error('Deezer requests not allowed'));
		Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
			.then(async (res) => {
				const dzRes = res.data;
				MopConsole.debug(LogLocation, `Found an image of artist with Deezer id ${ArtistDzId}`);
				resolve(dzRes.picture_big);
			})
			.catch((err) => {
				MopConsole.error('Artist.Deezer.API', err);
				reject();
			});
	},
);
