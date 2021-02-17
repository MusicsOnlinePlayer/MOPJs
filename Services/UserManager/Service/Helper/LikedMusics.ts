import { IMusic, isMusic } from 'lib/Models/Musics';
import { User } from 'lib/Models/Users';
import MopConsole from 'lib/MopConsole';
import { ObjectId } from 'mongodb';

const LogLocation = 'Services.UserManager.Helper.LikedMusics';

/** This function gets liked musics of an user
 * @param {ObjectId} UserId - User who wants his liked musics
 */
export const GetLikedMusics = async (UserId: ObjectId, Page = 0, PerPage = 8): Promise<Array<IMusic>> => {
	MopConsole.debug(LogLocation, `Getting liked musics of user with db id ${UserId}`);
	const FoundUser = await User.findById(UserId)
		.populate({
			path: 'LikedMusics',
			populate: [
				{
					path: 'AlbumId',
					model: 'Album',
				},
			],
		})
		.exec();
	MopConsole.debug(
		LogLocation,
		`Found ${FoundUser.LikedMusics ? FoundUser.LikedMusics.length : 0} liked musics of user with db id ${UserId}`
	);
	const ReversedLikedMusics = FoundUser.LikedMusics.reverse();
	const musics = ReversedLikedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
	return musics.map((m) => (isMusic(m) ? m : undefined));
};

/** This function check if this particular music is like by a specified user
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns {boolean} Is music liked ?
 */
export const IsLiked = async (MusicId: ObjectId, UserId: ObjectId): Promise<boolean> => {
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
export const LikeMusic = async (MusicId: ObjectId, UserId: ObjectId): Promise<boolean> => {
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
