import { ObjectId } from 'mongodb';
import { IMusic, IPlaylist, isMusic } from '../../Musics/Interfaces';
import MopConsole from '../../Tools/MopConsole';
import { User } from '../Model';
import { IUser } from '../Model/Interfaces';
import {
	GetPlaylistsIdOfUser,
} from '../Proxy/DB Proxy';

const Location = 'Users.Handler.DBHandler';

export * from '../Proxy/DB Proxy';

export const RegisterUser = (
	username : string,
	password : string,
) : Promise<IUser> => new Promise((resolve, reject) => {
	MopConsole.debug(Location, `A user named ${username} is trying to register an account`);
	try {
		const user = new User({
			username,
		});
		user.setPassword(password, async (err) => {
			if (err) {
				MopConsole.warn(Location, "Couldn't set password of user");
				MopConsole.warn(Location, err);
				reject();
				return;
			}
			const newUser = await user.save();
			resolve(newUser);
			MopConsole.info(Location, `Added user ${username}`);
		});
	} catch (err) {
		MopConsole.warn(Location, "Couldn't register user");
		MopConsole.warn(Location, err);
		reject();
	}
});

/** Get playlists of a specified user
 * @param {string} UserId Id of the user
 * @param {boolean} IncludePrivate should it include private playlist in response
 * @returns {Promise<object>} an object containing a creator object and an array of playlist ids
 */
export const GetPlaylistsOfUser = async (
	UserId: ObjectId,
	IncludePrivate: boolean,
): Promise<{PlaylistsId: Array<IPlaylist>, Creator: IUser}> => {
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
export const GetCurrentPlaylistOfUser = async (UserId: ObjectId) : Promise<{
	CurrentPlaylist: Array<IMusic>,
	CurrentPlaylistPlaying: number,
}> => {
	const MyUser = await User.findById(UserId).populate({
		path: 'CurrentPlaylist',
		populate: {
			path: 'AlbumId',
			model: 'Album',
		},
	});
	MopConsole.info('User.Handler.DBHandler', 'Retrieved CurrentPlaylist of user');

	return {
		CurrentPlaylist: MyUser.CurrentPlaylist.map((m) => (isMusic(m) ? m : undefined)),
		CurrentPlaylistPlaying: MyUser.CurrentPlaylistPlaying,
	};
};

/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} MusicIds Musics of the current playlist
 */
export const SetCurrentPlaylistOfUser = async (
	UserId: ObjectId,
	MusicIds: Array<ObjectId>,
) : Promise<void> => {
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
export const SetCurrentPlaylistPlayingOfUser = async (
	UserId: ObjectId,
	CurrentPlaylistPlaying: number,
) : Promise<void> => {
	await User.updateOne({ _id: UserId }, {
		$set: {
			CurrentPlaylistPlaying,
		},
	});
	MopConsole.info('User.Handler.DBHandler', 'Updated CurrentPlaylist playing of user');
};
