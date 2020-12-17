import { ObjectId } from 'mongodb';
import MopConsole from '../../../Tools/MopConsole';
import { Playlist } from '../../Model';

const LogLocation = 'Musics.Proxy.DBProxy.Playlist';

/** Append a playlist on mongo db
 * @param {string} Name - The name of the playlist (es searchable)
 * @param {string} MusicsId - An array of musics of the playlist
 * @param {string} UserId - Creator of the playlist
 * @param {boolean} IsPublic - evaluate if it is only visible for the creator
 * @returns {Promise<string>} Db id of the created music
 */
// eslint-disable-next-line import/prefer-default-export
export const CreatePlaylist = async (
	Name: string,
	MusicsId : Array<ObjectId>,
	UserId : ObjectId,
	IsPublic = true,
) : Promise<ObjectId> => {
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
