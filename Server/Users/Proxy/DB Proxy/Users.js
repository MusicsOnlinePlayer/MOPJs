const { User } = require('../../Model');
const MopConsole = require('../../../Tools/MopConsole');
const { Playlist } = require('../../../Musics/Model');

const Location = 'Users.Proxy.DBProxy';

/** This function gets liked musics of an user
 * @param {ObjectId} UserId - User who wants his liked musics
 */
const GetLikedMusicsOfUser = async (UserId) => {
	MopConsole.debug(Location, `Getting liked musics of user with db id ${UserId}`);
	const FoundUser = await User.findById(UserId).populate({
		path: 'LikedMusics',
		populate: [{
			path: 'AlbumId',
			model: 'Album',
		}],
	}).exec();
	MopConsole.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
	return FoundUser.LikedMusics;
};

/** This function gets viewed musics of an user
 * @param {ObjectId} UserId - User who wants his viewed musics
 */
const GetViewedMusicsOfUser = async (UserId) => {
	MopConsole.debug(Location, `Getting viewed musics of user with db id ${UserId}`);
	const FoundUser = await User.findById(UserId).populate({
		path: 'ViewedMusics',
		populate: [{
			path: 'AlbumId',
			model: 'Album',
		}],
	}).exec();
	MopConsole.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
	return FoundUser.ViewedMusics;
};

/** This function check if this particular music is like by a specified user
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns {boolean} Is music liked ?
 */
const CheckLikeMusic = async (MusicId, UserId) => {
	const FoundUser = await User.findById(UserId);
	const index = FoundUser.LikedMusics.indexOf(MusicId._id);
	return index !== -1;
};

/** This function add music to liked music of the user
 * if it is already like, then it will dislike the music to undo.
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns return true if the music is now liked by the user
 */
const LikeMusicOnUser = async (MusicId, UserId) => {
	const FoundUser = await User.findById(UserId);
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

/** This function add a music to a specified user history (async)
 * @param {ObjectId} MusicId - Music viewed by user
 * @param {ObjectId} UserId - User who viewed the music
*/
function RegisterToUserHistory(MusicId, UserId) {
	return new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Adding to music with id ${MusicId} to history of user with id ${UserId}`);
		User.findById(UserId, async (UserErr, UserDoc) => {
			if (UserErr) {
				MopConsole.error(Location, UserErr);
				reject();
				return;
			}
			UserDoc.ViewedMusics.push(MusicId);
			await UserDoc.save();
			MopConsole.info(Location, 'Saved to user history');
			resolve();
		});
	});
}

/** Get playlists of a specified user
 * @param {string} UserId Id of the user
 * @param {boolean} IncludePrivate should it include private playlist in response
 * @returns {Promise<string[]>} Array of playlist ids
 */
function GetPlaylistsIdOfUser(UserId, IncludePrivate) {
	return new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Getting playlists created by ${UserId} - include privates : ${IncludePrivate}`);
		const req = IncludePrivate ? { Creator: UserId } : { Creator: UserId, IsPublic: true };
		Playlist.find(req)
			.populate({ path: 'MusicsId', populate: { path: 'AlbumId', model: 'Album' } })
			.exec((err, docs) => {
				if (err) {
					MopConsole.error(Location, err);
					reject();
					return;
				}

				resolve(docs);
			});
	});
}

module.exports = {
	GetLikedMusicsOfUser,
	GetViewedMusicsOfUser,
	CheckLikeMusic,
	LikeMusicOnUser,
	RegisterToUserHistory,
	GetPlaylistsIdOfUser,
};
