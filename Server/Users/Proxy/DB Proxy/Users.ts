import { ObjectId } from 'mongodb';
import { User } from '../../Model';
import MopConsole from '../../../Tools/MopConsole';
import { Playlist } from '../../../Musics/Model';
import { IMusic, IPlaylist, isMusic } from '../../../Musics/Interfaces';

const Location = 'Users.Proxy.DBProxy';

/** This function gets liked musics of an user
 * @param {ObjectId} UserId - User who wants his liked musics
 */
export const GetLikedMusicsOfUser = async (
	UserId : ObjectId,
	Page = 0,
	PerPage = 8,
) : Promise<Array<IMusic>> => {
	MopConsole.debug(Location, `Getting liked musics of user with db id ${UserId}`);
	const FoundUser = await User
		.findById(UserId)
		.populate({
			path: 'LikedMusics',
			populate: [{
				path: 'AlbumId',
				model: 'Album',
			}],
		})
		.exec();
	MopConsole.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
	const ReversedLikedMusics = FoundUser.LikedMusics.reverse();
	const musics = ReversedLikedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
	return musics.map((m) => (isMusic(m) ? m : undefined));
};

/** This function gets viewed musics of an user
 * @param {ObjectId} UserId - User who wants his viewed musics
 */
export const GetViewedMusicsOfUser = async (
	UserId : ObjectId,
	Page = 0,
	PerPage = 8,
) : Promise<Array<IMusic>> => {
	MopConsole.debug(Location, `Getting viewed musics of user with db id ${UserId}`);
	const FoundUser = await User
		.findById(UserId)
		.populate({
			path: 'ViewedMusics',
			populate: [{
				path: 'AlbumId',
				model: 'Album',
			}],
		})
		.exec();
	MopConsole.debug(Location, `Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`);
	const ReversedViewedMusics = FoundUser.ViewedMusics.reverse();
	const musics = ReversedViewedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
	return musics.map((m) => (isMusic(m) ? m : undefined));
};

/** This function check if this particular music is like by a specified user
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns {boolean} Is music liked ?
 */
export const CheckLikeMusic = async (
	MusicId : ObjectId,
	UserId : ObjectId,
) : Promise<boolean> => {
	const FoundUser = await User.findById(UserId);
	const index = FoundUser.LikedMusics.indexOf(MusicId);
	return index !== -1;
};

/** This function add music to liked music of the user
 * if it is already like, then it will dislike the music to undo.
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns return true if the music is now liked by the user
 */
export const LikeMusicOnUser = async (
	MusicId : ObjectId,
	UserId : ObjectId,
) : Promise<boolean> => {
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
export function RegisterToUserHistory(
	MusicId : ObjectId,
	UserId : ObjectId,
) : Promise<void> {
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
export function GetPlaylistsIdOfUser(
	UserId : ObjectId,
	IncludePrivate: boolean,
) : Promise<Array<IPlaylist>> {
	return new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Getting playlists created by ${UserId} - include privates : ${IncludePrivate}`);
		const req = IncludePrivate ? { Creator: UserId } : { Creator: UserId, IsPublic: true };
		Playlist.find(req)
			.populate({ path: 'MusicsId', populate: { path: 'AlbumId', model: 'Album' } })
			.exec((err, docs) => {
				if (err) {
					MopConsole.error(Location, err.message);
					reject();
					return;
				}

				resolve(docs);
			});
	});
}
