"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetMusicsOfPlaylist = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Playlist';
/** This function gets all musics of a specified playlist from deezer API.
 * @param {number} PlaylistId - Playlist deezer id from deezer API.
 * @returns {Promise<Array<IDeezerMusic>>}Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
const GetMusicsOfPlaylist = (PlaylistId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Getting musics of playlist with deezer id ${PlaylistId}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve([]);
    axios_1.default.get(`https://api.deezer.com/playlist/${PlaylistId}/tracks`)
        .then((res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MusicsOfPlaylist = [];
        let ReqCount = 1;
        MusicsOfPlaylist.push(...res.data.data);
        MopConsole_1.default.debug(LogLocation, `Found ${res.data.data.length} musics ${ReqCount}`);
        let NextUrl = res.data.next;
        while (NextUrl) {
            let nextRes;
            try {
                nextRes = yield axios_1.default.get(NextUrl);
                ReqCount += 1;
                MusicsOfPlaylist.push(...nextRes.data.data);
                MopConsole_1.default.debug(LogLocation, `Found ${nextRes.data.data.length} musics ${ReqCount}`);
            }
            catch (handlerErr) {
                MopConsole_1.default.error(LogLocation, handlerErr);
            }
            NextUrl = nextRes.data ? nextRes.data.next : undefined;
        }
        resolve(MusicsOfPlaylist);
    }))
        .catch((err) => {
        MopConsole_1.default.error(LogLocation, err);
        reject();
    });
});
exports.GetMusicsOfPlaylist = GetMusicsOfPlaylist;
