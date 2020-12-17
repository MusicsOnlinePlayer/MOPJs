"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Search';
/** This function gets all musics from deezer API matching a query.
 * @param {string} Query - The actual query sent to Deezer API
 * @returns {Promise<Array<IDeezerMusic>>} Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
exports.SearchMusics = (Query) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Begin search for query ${Query}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve([]);
    axios_1.default.get(`https://api.deezer.com/search?q=${Query}`)
        .then((res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        MopConsole_1.default.debug(LogLocation, `Found ${res.data.data.length} musics`);
        resolve(res.data.data);
    }))
        .catch((err) => {
        MopConsole_1.default.error(LogLocation, err);
        reject();
    });
});
