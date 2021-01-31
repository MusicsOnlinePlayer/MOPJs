"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckIfDeezerReqAreAllowed = void 0;
const tslib_1 = require("tslib");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const MopConf_json_1 = require("../../../Config/MopConf.json");
const Location = 'Musics.Proxy.DeezerProxy.Misc';
if (MopConf_json_1.DisableDeezerClient) {
    MopConsole_1.default.warn(Location, 'Deezer requests are disable in config file (MopConf.json)');
}
/** This function checks if deezer request are allowed (in MopConf.json).
 * @returns {boolean} returns value in MopConf.json (True for disable)
 */
// eslint-disable-next-line import/prefer-default-export
const CheckIfDeezerReqAreAllowed = () => {
    if (MopConf_json_1.DisableDeezerClient) {
        MopConsole_1.default.debug(Location, 'Deezer requests are disabled');
        return true;
    }
    return false;
};
exports.CheckIfDeezerReqAreAllowed = CheckIfDeezerReqAreAllowed;
