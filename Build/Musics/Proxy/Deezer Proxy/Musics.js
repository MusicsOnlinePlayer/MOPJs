"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Musics';
/** This function gets all musics of a specified album (here by a deezer id)
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
exports.GetMusicOfAlbum = (AlbumDzId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Begin request of musics from album with Deezer id ${AlbumDzId}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve([]);
    axios_1.default.get(`https://api.deezer.com/album/${AlbumDzId}/tracks`)
        .then((res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MusicsOfAlbums = [];
        MusicsOfAlbums.push(...res.data.data);
        MopConsole_1.default.debug(LogLocation, `Received ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);
        let nextUrl = res.data.next;
        while (nextUrl) {
            let nextRes;
            try {
                nextRes = yield axios_1.default.get(nextUrl);
                MusicsOfAlbums.push(...nextRes.data.data);
            }
            catch (handlerErr) {
                MopConsole_1.default.error(LogLocation, handlerErr);
            }
            nextUrl = nextRes.data ? nextRes.data.next : undefined;
        }
        MopConsole_1.default.debug(LogLocation, `Received a total of ${MusicsOfAlbums.length} musics for album with Deezer id ${AlbumDzId}`);
        resolve(MusicsOfAlbums);
    }))
        .catch((err) => {
        MopConsole_1.default.error(LogLocation, err);
        reject();
    });
});
