"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.DBSearch.Playlists';
// eslint-disable-next-line import/prefer-default-export
exports.DBPlaylistSearch = (Query, Page = 0, PerPage = 8) => new Promise((resolve, reject) => {
    Model_1.Playlist
        .find({ $text: { $search: Query }, IsPublic: true })
        .limit(PerPage)
        .skip(Page * PerPage)
        .populate({
        path: 'MusicsId',
        populate: {
            path: 'AlbumId',
            model: 'Album',
        },
    })
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
