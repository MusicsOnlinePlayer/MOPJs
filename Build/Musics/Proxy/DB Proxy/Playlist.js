"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlaylist = void 0;
const tslib_1 = require("tslib");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Model_1 = require("../../Model");
const LogLocation = 'Musics.Proxy.DBProxy.Playlist';
/** Append a playlist on mongo db
 * @param {string} Name - The name of the playlist (es searchable)
 * @param {string} MusicsId - An array of musics of the playlist
 * @param {string} UserId - Creator of the playlist
 * @param {boolean} IsPublic - evaluate if it is only visible for the creator
 * @returns {Promise<string>} Db id of the created music
 */
// eslint-disable-next-line import/prefer-default-export
const CreatePlaylist = async (Name, MusicsId, UserId, IsPublic = true) => {
    MopConsole_1.default.info(LogLocation, `Creating a ${IsPublic ? 'public' : 'private'} playlist named ${Name} for ${UserId}`);
    const p = await Model_1.Playlist.create({
        Name,
        IsPublic,
        Creator: UserId,
        MusicsId,
    });
    MopConsole_1.default.info(LogLocation, `Created playlist with id ${p._id}`);
    return p._id;
};
exports.CreatePlaylist = CreatePlaylist;
