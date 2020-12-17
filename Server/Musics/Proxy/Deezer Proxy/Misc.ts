import MopConsole from '../../../Tools/MopConsole';
import { DisableDeezerClient } from '../../../Config/MopConf.json';

const Location = 'Musics.Proxy.DeezerProxy.Misc';

if (DisableDeezerClient) {
	MopConsole.warn(Location, 'Deezer requests are disable in config file (MopConf.json)');
}

/** This function checks if deezer request are allowed (in MopConf.json).
 * @returns {boolean} returns value in MopConf.json (True for disable)
 */

// eslint-disable-next-line import/prefer-default-export
export const CheckIfDeezerReqAreAllowed = () : boolean => {
	if (DisableDeezerClient) {
		MopConsole.debug(Location, 'Deezer requests are disabled');
		return true;
	}
	return false;
};
