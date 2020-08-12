const MopConsole = require('../../../Tools/MopConsole');
const { DisableDeezerClient } = require('../../../Config/MopConf.json');

const Location = 'Musics.Proxy.DeezerProxy.Misc';

if (DisableDeezerClient) {
	MopConsole.warn(Location, 'Deezer requests are disable in config file (MopConf.json)');
}

/** This function checks if deezer request are allowed (in MopConf.json).
 * @returns {boolean} returns value in MopConf.json (True for disable)
 */
const CheckIfDeezerReqAreAllowed = () => {
	if (DisableDeezerClient) {
		MopConsole.debug(Location, 'Deezer requests are disabled');
		return true;
	}
	return false;
};

module.exports = {
	CheckIfDeezerReqAreAllowed,
};
