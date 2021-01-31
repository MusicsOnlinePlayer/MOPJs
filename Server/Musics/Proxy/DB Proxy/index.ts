import { ObjectId } from 'mongodb';
import { FindAlbumContainingMusic, HandleAlbumsFromDz, UpdateAlbumCompleteStatus } from './Albums';
import {
	AppendOrUpdateMusicsToAlbum,
	DoesMusicExistsTitle,
	DoesMusicExistsTitleDzId,
	AddMusicToDatabase,
	UpdateRanksBulk,
} from './Musics';
import { ConvertTagsFromDisk, ConvertTagsFromDz } from '../../Tags';
import { IDeezerMusic, IDiskMusic } from '../../Interfaces';

/** This function add a new music with tags coming from ID3 file.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicFilePath
 */
export const HandleNewMusicFromDisk = async (
	tags : IDiskMusic, MusicFilePath: string,
): Promise<void> => {
	if (await DoesMusicExistsTitle(tags.title)) return;
	const diskImport = ConvertTagsFromDisk(tags, MusicFilePath);
	await AddMusicToDatabase(
		diskImport.ImportedMusic,
		diskImport.ImportedAlbum,
		diskImport.ImportedArtist,
	);
};

/** This function add a new music with tags coming from deezer API.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @returns {Promise<ObjectId>} Promise resolve by Music db id
 */
export const HandleNewMusicFromDz = async (
	tags : IDeezerMusic,
) : Promise<ObjectId> => {
	if (await DoesMusicExistsTitleDzId(tags.title, tags.id)) { return; }
	/* eslint consistent-return: "off" */
	const deezerImport = ConvertTagsFromDz(tags, tags.id);
	return await AddMusicToDatabase(
		deezerImport.ImportedMusic,
		deezerImport.ImportedAlbum,
		deezerImport.ImportedArtist,
		tags.artist.picture_big,
	);
};

export {
	FindAlbumContainingMusic,
	HandleAlbumsFromDz,
	AppendOrUpdateMusicsToAlbum,
	UpdateAlbumCompleteStatus,
	UpdateRanksBulk,
};
