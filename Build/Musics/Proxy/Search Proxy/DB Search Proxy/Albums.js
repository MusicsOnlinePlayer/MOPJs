"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBAlbumSearch = void 0;
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.DBSearch.Albums';
// eslint-disable-next-line import/prefer-default-export
const DBAlbumSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
    Model_1.Album
        .find({ $text: { $search: Query } })
        .limit(PerPage)
        .skip(Page * PerPage)
        .populate('MusicsId')
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
exports.DBAlbumSearch = DBAlbumSearch;
