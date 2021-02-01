import Axios from 'axios';
import MopConsole from '../../../Tools/MopConsole';
import { IDeezerMusic } from '../../Interfaces';
import { CheckIfDeezerReqAreAllowed } from './Misc';

const LogLocation = 'Musics.Proxy.DeezerProxy.Trending';

/** This function gets trending music from deezer Api
 * @returns {Promise<Array<IDeezerMusic>>}Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
export const GetTrendingMusics = ():
Promise<Array<IDeezerMusic>> => new Promise<Array<IDeezerMusic>>(
	(resolve, reject) => {
		MopConsole.debug(LogLocation, 'Begin request of trending');
		if (CheckIfDeezerReqAreAllowed()) resolve([]);
		Axios.get('https://api.deezer.com/chart')
			.then(async (res) => {
				const TrendingMusics: Array<IDeezerMusic> = [];
				TrendingMusics.push(...res.data.tracks.data);
				MopConsole.debug(LogLocation, `Received ${TrendingMusics.length} musics for trending`);
				resolve(TrendingMusics);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	},
);
