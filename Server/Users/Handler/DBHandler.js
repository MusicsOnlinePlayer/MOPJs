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

/** Get Current Playlist of specified user
 * @param {string} UserId id of the user
 * @returns {Promise<Music[]>} An array of current playlists' musics
 */
const GetCurrentPlaylistOfUser = async (UserId) => {
	const MyUser = await User.findById(UserId).populate({
		path: 'CurrentPlaylist',
		populate: {
			path: 'AlbumId',
			model: 'Album',
		},
	});
	MopConsole.info('User.Handler.DBHandler', 'Retrieved CurrentPlaylist of user');
	return {
		CurrentPlaylist: MyUser.CurrentPlaylist,
		CurrentPlaylistPlaying: MyUser.CurrentPlaylistPlaying,
	};
};

/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} MusicIds Musics of the current playlist
 */
const SetCurrentPlaylistOfUser = async (UserId, MusicIds) => {
	await User.updateOne({ _id: UserId }, {
		$set: {
			CurrentPlaylist: MusicIds,
		},
	});
	MopConsole.info('User.Handler.DBHandler', 'Updated CurrentPlaylist musics of user');
};

/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} CurrentPlaylistPlaying Music id played on the client
 */
const SetCurrentPlaylistPlayingOfUser = async (UserId, CurrentPlaylistPlaying) => {
	await User.updateOne({ _id: UserId }, {
		$set: {
			CurrentPlaylistPlaying,
		},
	});
	MopConsole.info('User.Handler.DBHandler', 'Updated CurrentPlaylist playing of user');
};


module.exports = {
	RegisterUser,
	GetLikedMusicsOfUserReq,
	GetViewedMusicsOfUserReq,
	CheckIfMusicIsLikedByUserReq,
	LikeMusicOnUserReq,
	RegisterToUserHistory,
	GetPlaylistsOfUser,
	GetCurrentPlaylistOfUser,
	SetCurrentPlaylistOfUser,
	SetCurrentPlaylistPlayingOfUser,
};
