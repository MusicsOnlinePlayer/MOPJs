"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTrendingMusics = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Trending';
/** This function gets trending music from deezer Api
 * @returns {Promise<Array<IDeezerMusic>>}Data from deezer API, not formatted for a usage in MongoDB
 */
// eslint-disable-next-line import/prefer-default-export
const GetTrendingMusics = () => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, 'Begin request of trending');
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve([]);
    axios_1.default.get('https://api.deezer.com/chart')
        .then(async (res) => {
        const TrendingMusics = [];
        TrendingMusics.push(...res.data.tracks.data);
        MopConsole_1.default.debug(LogLocation, `Received ${TrendingMusics.length} musics for trending`);
        resolve(TrendingMusics);
    })
        .catch((err) => {
        MopConsole_1.default.error(LogLocation, err);
        reject();
    });
});
exports.GetTrendingMusics = GetTrendingMusics;
