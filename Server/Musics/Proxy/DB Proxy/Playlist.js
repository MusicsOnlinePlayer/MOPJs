const MopConsole = require('../../../Tools/MopConsole');
const { Playlist } = require('../../Model');

const LogLocation = 'Musics.Proxy.DBProxy.Playlist';

/** Append a playlist on mongo db
 * @param {string} Name - The name of the playlist (es searchable)
 * @param {string} MusicsId - An array of musics of the playlist
 * @param {string} UserId - Creator of the playlist
 * @param {boolean} IsPublic - evaluate if it is only visible for the creator
 * @returns {Promise<string>} Db id of the created music
 */
const CreatePlaylist = async (Name, MusicsId, UserId, IsPublic = true) => {
	MopConsole.info(LogLocation, `Creating a ${IsPublic ? 'public' : 'private'} playlist named ${Name} for ${UserId}`);
	const p = await Playlist.create({
		Name,
		IsPublic,
		Creator: UserId,
		MusicsId,
	});
	MopConsole.info(LogLocation, `Created playlist with id ${p._id}`);
	return p._id;
};

module.exports = {
	CreatePlaylist,
};
