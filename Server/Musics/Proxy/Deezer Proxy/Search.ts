import Axios from 'axios';
import MopConsole from '../../../Tools/MopConsole';
import { IDeezerMusic } from '../../Interfaces';
import { CheckIfDeezerReqAreAllowed } from './Misc';

const LogLocation = 'Musics.Proxy.DeezerProxy.Search';

/** This function gets all musics from deezer API matching a query.
 * @param {string} Query - The actual query sent to Deezer API
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
export const SearchMusics = (Query : string) : Promise<Array<IDeezerMusic>> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin search for query ${Query}`);
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get(`https://api.deezer.com/search?q=${Query}`)
			.then(async (res) => {
				MopConsole.debug(LogLocation, `Found ${res.data.data.length} musics`);
				resolve(res.data.data);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	},
);
