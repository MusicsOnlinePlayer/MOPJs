"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetCurrentPlaylistPlayingOfUser = exports.SetCurrentPlaylistOfUser = exports.GetCurrentPlaylistOfUser = exports.GetPlaylistsOfUser = exports.RegisterUser = void 0;
const tslib_1 = require("tslib");
const Interfaces_1 = require("../../Musics/Interfaces");
const MopConsole_1 = tslib_1.__importDefault(require("../../Tools/MopConsole"));
const Model_1 = require("../Model");
const DB_Proxy_1 = require("../Proxy/DB Proxy");
const Location = 'Users.Handler.DBHandler';
tslib_1.__exportStar(require("../Proxy/DB Proxy"), exports);
const RegisterUser = (username, password) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `A user named ${username} is trying to register an account`);
    try {
        const user = new Model_1.User({
            username,
        });
        user.setPassword(password, (err) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                MopConsole_1.default.warn(Location, "Couldn't set password of user");
                MopConsole_1.default.warn(Location, err);
                reject();
                return;
            }
            const newUser = yield user.save();
            resolve(newUser);
            MopConsole_1.default.info(Location, `Added user ${username}`);
        }));
    }
    catch (err) {
        MopConsole_1.default.warn(Location, "Couldn't register user");
        MopConsole_1.default.warn(Location, err);
        reject();
    }
});
exports.RegisterUser = RegisterUser;
/** Get playlists of a specified user
 * @param {string} UserId Id of the user
 * @param {boolean} IncludePrivate should it include private playlist in response
 * @returns {Promise<object>} an object containing a creator object and an array of playlist ids
 */
const GetPlaylistsOfUser = (UserId, IncludePrivate) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const PlaylistsId = yield DB_Proxy_1.GetPlaylistsIdOfUser(UserId, IncludePrivate);
    const Creator = yield Model_1.User.findById(UserId);
    return {
        PlaylistsId,
        Creator,
    };
});
exports.GetPlaylistsOfUser = GetPlaylistsOfUser;
/** Get Current Playlist of specified user
 * @param {string} UserId id of the user
 * @returns {Promise<Music[]>} An array of current playlists' musics
 */
const GetCurrentPlaylistOfUser = (UserId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const MyUser = yield Model_1.User.findById(UserId).populate({
        path: 'CurrentPlaylist',
        populate: {
            path: 'AlbumId',
            model: 'Album',
        },
    });
    MopConsole_1.default.info('User.Handler.DBHandler', 'Retrieved CurrentPlaylist of user');
    return {
        CurrentPlaylist: MyUser.CurrentPlaylist.map((m) => (Interfaces_1.isMusic(m) ? m : undefined)),
        CurrentPlaylistPlaying: MyUser.CurrentPlaylistPlaying,
    };
});
exports.GetCurrentPlaylistOfUser = GetCurrentPlaylistOfUser;
/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} MusicIds Musics of the current playlist
 */
const SetCurrentPlaylistOfUser = (UserId, MusicIds) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield Model_1.User.updateOne({ _id: UserId }, {
        $set: {
            CurrentPlaylist: MusicIds,
        },
    });
    MopConsole_1.default.info('User.Handler.DBHandler', 'Updated CurrentPlaylist musics of user');
});
exports.SetCurrentPlaylistOfUser = SetCurrentPlaylistOfUser;
/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} CurrentPlaylistPlaying Music id played on the client
 */
const SetCurrentPlaylistPlayingOfUser = (UserId, CurrentPlaylistPlaying) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield Model_1.User.updateOne({ _id: UserId }, {
        $set: {
            CurrentPlaylistPlaying,
        },
    });
    MopConsole_1.default.info('User.Handler.DBHandler', 'Updated CurrentPlaylist playing of user');
});
exports.SetCurrentPlaylistPlayingOfUser = SetCurrentPlaylistPlayingOfUser;
