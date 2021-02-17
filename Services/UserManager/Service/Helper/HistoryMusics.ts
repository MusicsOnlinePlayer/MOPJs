import { IMusic, isMusic } from 'lib/Models/Musics';
import { User } from 'lib/Models/Users';
import MopConsole from 'lib/MopConsole';
import { ObjectId } from 'mongodb';

const LogLocation = 'Services.UserManager.Helper.HistoryMusics';

/** This function gets viewed musics of an user
 * @param {ObjectId} UserId - User who wants his viewed musics
 */
export const GetViewedMusicsOfUser = async (UserId: ObjectId, Page = 0, PerPage = 8): Promise<Array<IMusic>> => {
	MopConsole.debug(LogLocation, `Getting viewed musics of user with db id ${UserId}`);
	const FoundUser = await User.findById(UserId)
		.populate({
			path: 'ViewedMusics',
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
	const ReversedViewedMusics = FoundUser.ViewedMusics.reverse();
	const musics = ReversedViewedMusics.slice(Page * PerPage, Page * PerPage + PerPage);
	return musics.map((m) => (isMusic(m) ? m : undefined));
};

/** This function add a music to a specified user history (async)
 * @param {ObjectId} MusicId - Music viewed by user
 * @param {ObjectId} UserId - User who viewed the music
 */
export function AddToHistory(MusicId: ObjectId, UserId: ObjectId): Promise<void> {
	return new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Adding to music with id ${MusicId} to history of user with id ${UserId}`);
		User.findById(UserId, undefined, undefined, async (UserErr, UserDoc) => {
			if (UserErr) {
				MopConsole.error(LogLocation, UserErr.message);
				reject();
				return;
			}
			UserDoc.ViewedMusics.push(MusicId);
			await UserDoc.save();
			MopConsole.info(LogLocation, 'Saved to user history');
			resolve();
		});
	});
}
