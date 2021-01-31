"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetPlaylistsIdOfUser = exports.RegisterToUserHistory = exports.LikeMusicOnUser = exports.CheckLikeMusic = exports.GetViewedMusicsOfUser = exports.GetLikedMusicsOfUser = void 0;
const tslib_1 = require("tslib");
const Model_1 = require("../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Model_2 = require("../../../Musics/Model");
const Interfaces_1 = require("../../../Musics/Interfaces");
const Location = 'Users.Proxy.DBProxy';
/** This function gets liked musics of an user
 * @param {ObjectId} UserId - User who wants his liked musics
 */
const GetLikedMusicsOfUser = async (UserId, Page = 0, PerPage = 8) => {
    MopConsole_1.default.debug(Location, `Getting liked musics of user with db id ${UserId}`);
    const FoundUser = await Model_1.User
        .findById(UserId)
        .populate({
        path: 'LikedMusics',
        populate: [{
                path: 'AlbumId',
                model: 'Album',
            }],
    })
        .exec();
    MopConsole_1.default.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
    const ReversedLikedMusics = FoundUser.LikedMusics.reverse();
    const musics = ReversedLikedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
    return musics.map((m) => (Interfaces_1.isMusic(m) ? m : undefined));
};
exports.GetLikedMusicsOfUser = GetLikedMusicsOfUser;
/** This function gets viewed musics of an user
 * @param {ObjectId} UserId - User who wants his viewed musics
 */
const GetViewedMusicsOfUser = async (UserId, Page = 0, PerPage = 8) => {
    MopConsole_1.default.debug(Location, `Getting viewed musics of user with db id ${UserId}`);
    const FoundUser = await Model_1.User
        .findById(UserId)
        .populate({
        path: 'ViewedMusics',
        populate: [{
                path: 'AlbumId',
                model: 'Album',
            }],
    })
        .exec();
    MopConsole_1.default.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
    const ReversedViewedMusics = FoundUser.ViewedMusics.reverse();
    const musics = ReversedViewedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
    return musics.map((m) => (Interfaces_1.isMusic(m) ? m : undefined));
};
exports.GetViewedMusicsOfUser = GetViewedMusicsOfUser;
/** This function check if this particular music is like by a specified user
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns {boolean} Is music liked ?
 */
const CheckLikeMusic = async (MusicId, UserId) => {
    const FoundUser = await Model_1.User.findById(UserId);
    const index = FoundUser.LikedMusics.indexOf(MusicId);
    return index !== -1;
};
exports.CheckLikeMusic = CheckLikeMusic;
/** This function add music to liked music of the user
 * if it is already like, then it will dislike the music to undo.
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns return true if the music is now liked by the user
 */
const LikeMusicOnUser = async (MusicId, UserId) => {
    const FoundUser = await Model_1.User.findById(UserId);
    const index = FoundUser.LikedMusics.indexOf(MusicId);
    if (index === -1) {
        FoundUser.LikedMusics.push(MusicId);
        await FoundUser.save();
        return true;
    }
    FoundUser.LikedMusics.splice(index, 1);
    await FoundUser.save();
    return false;
};
exports.LikeMusicOnUser = LikeMusicOnUser;
/** This function add a music to a specified user history (async)
 * @param {ObjectId} MusicId - Music viewed by user
 * @param {ObjectId} UserId - User who viewed the music
*/
function RegisterToUserHistory(MusicId, UserId) {
    return new Promise((resolve, reject) => {
        MopConsole_1.default.debug(Location, `Adding to music with id ${MusicId} to history of user with id ${UserId}`);
        Model_1.User.findById(UserId, async (UserErr, UserDoc) => {
            if (UserErr) {
                MopConsole_1.default.error(Location, UserErr);
                reject();
                return;
            }
            UserDoc.ViewedMusics.push(MusicId);
            await UserDoc.save();
            MopConsole_1.default.info(Location, 'Saved to user history');
            resolve();
        });
    });
}
exports.RegisterToUserHistory = RegisterToUserHistory;
/** Get playlists of a specified user
 * @param {string} UserId Id of the user
 * @param {boolean} IncludePrivate should it include private playlist in response
 * @returns {Promise<string[]>} Array of playlist ids
 */
function GetPlaylistsIdOfUser(UserId, IncludePrivate) {
    return new Promise((resolve, reject) => {
        MopConsole_1.default.debug(Location, `Getting playlists created by ${UserId} - include privates : ${IncludePrivate}`);
        const req = IncludePrivate ? { Creator: UserId } : { Creator: UserId, IsPublic: true };
        Model_2.Playlist.find(req)
            .populate({ path: 'MusicsId', populate: { path: 'AlbumId', model: 'Album' } })
            .exec((err, docs) => {
            if (err) {
                MopConsole_1.default.error(Location, err.message);
                reject();
                return;
            }
            resolve(docs);
        });
    });
}
exports.GetPlaylistsIdOfUser = GetPlaylistsIdOfUser;
