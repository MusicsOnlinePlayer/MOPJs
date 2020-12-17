"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const DeezerHandler_1 = require("./DeezerHandler");
const Search_Proxy_1 = tslib_1.__importDefault(require("../Proxy/Search Proxy"));
const Playlist_1 = require("../Proxy/Deezer Proxy/Playlist");
const Playlist_2 = require("../Proxy/DB Proxy/Playlist");
exports.CreatePlaylist = Playlist_2.CreatePlaylist;
const DBHandler_1 = require("./DBHandler");
tslib_1.__exportStar(require("./DBHandler"), exports);
const SearchAndAddMusicsDeezer = (Query) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const searchRes = yield DeezerHandler_1.SearchMusics(Query);
    yield DBHandler_1.AddMusicsFromDeezer(searchRes);
    yield Search_Proxy_1.default.RefreshEsMusicIndex();
});
exports.SearchAndAddMusicsDeezer = SearchAndAddMusicsDeezer;
/** Retrieve musics of a specified deezer playlist and add musics to db id
 * @param {number} PlaylistDzId deezer id of a deezer playlist
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
const GetAndAddMusicOfDeezerPlaylist = (PlaylistDzId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const dzMusics = yield Playlist_1.GetMusicsOfPlaylist(PlaylistDzId);
    return yield DBHandler_1.AddMusicsFromDeezer(dzMusics);
});
const ConstructPlaylistFromDz = (PlaylistDzId, PlaylistName, UserId, IsPublic) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const MusicsIdsOfPlaylist = yield GetAndAddMusicOfDeezerPlaylist(PlaylistDzId);
    const pId = yield Playlist_2.CreatePlaylist(PlaylistName, MusicsIdsOfPlaylist, UserId, IsPublic);
    return pId;
});
exports.ConstructPlaylistFromDz = ConstructPlaylistFromDz;
