import axios from 'axios';
import MopConsole from 'lib/MopConsole';
import { IDeezerMusic } from 'lib/Types/Deezer';

const LogLocation = 'Services.DeezerImporter.DeezerApi';
/** This function gets all musics from deezer API matching a query.
 * @param {string} Query - The actual query sent to Deezer API
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
export const SearchDeezerMusics = (Query: string): Promise<IDeezerMusic[]> =>
	new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Getting musics (query: ${Query})`);
		axios
			.get(`https://api.deezer.com/search?q=${Query}`)
			.then(async (res) => {
				MopConsole.debug(LogLocation, `Got ${res.data.data.length} musics (query: ${Query})`);
				resolve(res.data.data);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	});
