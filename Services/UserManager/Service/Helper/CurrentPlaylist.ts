import { IMusic, isMusic } from 'lib/Models/Musics';
import { User } from 'lib/Models/Users';
import MopConsole from 'lib/MopConsole';
import { ObjectId } from 'mongodb';

const LogLocation = 'Services.UserManager.Helper.CurrentPlaylist';

/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} MusicIds Musics of the current playlist
 */
export const SetCurrentPlaylistOfUser = async (UserId: ObjectId, MusicIds: Array<ObjectId>): Promise<void> => {
	await User.updateOne(
		{ _id: UserId },
		{
			$set: {
				CurrentPlaylist: MusicIds,
			},
		}
	);
	MopConsole.info(LogLocation, 'Updated CurrentPlaylist musics of user');
};

/** Set Current Playlist of specified user
 * @param {string} UserId id of the user
 * @param {string[]} CurrentPlaylistPlaying Music id played on the client
 */
export const SetCurrentPlaylistPlayingOfUser = async (
	UserId: ObjectId,
	CurrentPlaylistPlaying: number
): Promise<void> => {
	await User.updateOne(
		{ _id: UserId },
		{
			$set: {
				CurrentPlaylistPlaying,
			},
		}
	);
	MopConsole.info(LogLocation, 'Updated CurrentPlaylist playing of user');
};

/** Get Current Playlist of specified user
 * @param {string} UserId id of the user
 * @returns {Promise<Music[]>} An array of current playlists' musics
 */
export const GetCurrentPlaylistOfUser = async (
	UserId: ObjectId
): Promise<{
	CurrentPlaylist: Array<IMusic>;
	CurrentPlaylistPlaying: number;
}> => {
	const MyUser = await User.findById(UserId).populate({
		path: 'CurrentPlaylist',
		populate: {
			path: 'AlbumId',
			model: 'Album',
		},
	});
	MopConsole.info(LogLocation, 'Retrieved CurrentPlaylist of user');

	return {
		CurrentPlaylist: MyUser.CurrentPlaylist.map((m) => (isMusic(m) ? m : undefined)),
		CurrentPlaylistPlaying: MyUser.CurrentPlaylistPlaying,
	};
};
