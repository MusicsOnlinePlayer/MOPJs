"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBMusicSearch = void 0;
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.DBSearch.Musics';
// eslint-disable-next-line import/prefer-default-export
const DBMusicSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
    Model_1.Music
        .find({ $text: { $search: Query } }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' }, Rank: -1 })
        .limit(PerPage)
        .skip(Page * PerPage)
        .populate('AlbumId')
        .exec((err, result) => {
        if (err) {
            MopConsole_1.default.error(LogLocation, err.message);
            return;
        }
        if (!result) {
            MopConsole_1.default.error(LogLocation, 'Request error !');
            reject(new Error('Request Error'));
            return;
        }
        resolve(result);
    });
});
exports.DBMusicSearch = DBMusicSearch;
