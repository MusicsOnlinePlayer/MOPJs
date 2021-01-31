"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlaylist = exports.ConstructPlaylistFromDz = exports.SearchAndAddMusicsDeezer = void 0;
const tslib_1 = require("tslib");
const DeezerHandler_1 = require("./DeezerHandler");
const Search_Proxy_1 = tslib_1.__importDefault(require("../Proxy/Search Proxy"));
const Playlist_1 = require("../Proxy/Deezer Proxy/Playlist");
const Playlist_2 = require("../Proxy/DB Proxy/Playlist");
Object.defineProperty(exports, "CreatePlaylist", { enumerable: true, get: function () { return Playlist_2.CreatePlaylist; } });
const DBHandler_1 = require("./DBHandler");
tslib_1.__exportStar(require("./DBHandler"), exports);
const SearchAndAddMusicsDeezer = async (Query) => {
    const searchRes = await DeezerHandler_1.SearchMusics(Query);
    await DBHandler_1.AddMusicsFromDeezer(searchRes);
    await Search_Proxy_1.default.RefreshEsMusicIndex();
};
exports.SearchAndAddMusicsDeezer = SearchAndAddMusicsDeezer;
/** Retrieve musics of a specified deezer playlist and add musics to db id
 * @param {number} PlaylistDzId deezer id of a deezer playlist
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
const GetAndAddMusicOfDeezerPlaylist = async (PlaylistDzId) => {
    const dzMusics = await Playlist_1.GetMusicsOfPlaylist(PlaylistDzId);
    return await DBHandler_1.AddMusicsFromDeezer(dzMusics);
};
const ConstructPlaylistFromDz = async (PlaylistDzId, PlaylistName, UserId, IsPublic) => {
    const MusicsIdsOfPlaylist = await GetAndAddMusicOfDeezerPlaylist(PlaylistDzId);
    const pId = await Playlist_2.CreatePlaylist(PlaylistName, MusicsIdsOfPlaylist, UserId, IsPublic);
    return pId;
};
exports.ConstructPlaylistFromDz = ConstructPlaylistFromDz;
