const MopConsole = require('../../Tools/MopConsole');
const { User } = require('../Model');
const {
	GetLikedMusicsOfUser,
	GetViewedMusicsOfUser,
	CheckLikeMusic,
	LikeMusicOnUser,
	RegisterToUserHistory,
	GetPlaylistsIdOfUser,
} = require('../Proxy/DB Proxy');

const Location = 'Users.Handler.DBHandler';

const RegisterUser = (username, password) => new Promise((resolve, reject) => {
	MopConsole.debug(Location, `A user named ${username} is trying to register an account`);
	try {
		const user = new User({
			username,
		});
		user.setPassword(password)
			.then(async () => {
				const newUser = await user.save();
				resolve(newUser);
				MopConsole.info(Location, `Added user ${username}`);
			})
			.catch((err) => {
				MopConsole.warn(Location, "Couldn't set password of user");
				MopConsole.warn(Location, err);
				reject();
			});
	} catch (err) {
		MopConsole.warn(Location, "Couldn't register user");
		MopConsole.warn(Location, err);
		reject();
	}
});

const GetLikedMusicsOfUserReq = async (UserReq) => await GetLikedMusicsOfUser(UserReq._id);

const GetViewedMusicsOfUserReq = async (UserReq) => await GetViewedMusicsOfUser(UserReq._id);

const CheckIfMusicIsLikedByUserReq = async (
	UserReq,
	MusicId,
) => await CheckLikeMusic(MusicId, UserReq._id);

const LikeMusicOnUserReq = async (
	UserReq,
	MusicId,
) => await LikeMusicOnUser(MusicId, UserReq._id);

/** Get playlists of a specified user
 * @param {string} UserId Id of the user
 * @param {boolean} IncludePrivate should it include private playlist in response
 * @returns {Promise<object>} an object containing a creator object and an array of playlist ids
 */
const GetPlaylistsOfUser = async (UserId, IncludePrivate) => {
	const PlaylistsId = await GetPlaylistsIdOfUser(UserId, IncludePrivate);
	const Creator = await User.findById(UserId);
	return {
		PlaylistsId,
		Creator,
	};
};

module.exports = {
	RegisterUser,
	GetLikedMusicsOfUserReq,
	GetViewedMusicsOfUserReq,
	CheckIfMusicIsLikedByUserReq,
	LikeMusicOnUserReq,
	RegisterToUserHistory,
	GetPlaylistsOfUser,
};
