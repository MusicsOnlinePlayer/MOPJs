import { ObjectId } from 'mongodb';
import { SearchMusics } from './DeezerHandler';
import Search from '../Proxy/Search Proxy';
import { GetMusicsOfPlaylist } from '../Proxy/Deezer Proxy/Playlist';
import { CreatePlaylist } from '../Proxy/DB Proxy/Playlist';
import { AddMusicsFromDeezer } from './DBHandler';

export * from './DBHandler';

const SearchAndAddMusicsDeezer = async (Query: string) : Promise<void> => {
	const searchRes = await SearchMusics(Query);
	await AddMusicsFromDeezer(searchRes);
	await Search.RefreshEsMusicIndex();
};

/** Retrieve musics of a specified deezer playlist and add musics to db id
 * @param {number} PlaylistDzId deezer id of a deezer playlist
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
const GetAndAddMusicOfDeezerPlaylist = async (PlaylistDzId : number) => {
	const dzMusics = await GetMusicsOfPlaylist(PlaylistDzId);
	return await AddMusicsFromDeezer(dzMusics);
};

const ConstructPlaylistFromDz = async (
	PlaylistDzId : number,
	PlaylistName : string,
	UserId : ObjectId,
	IsPublic : boolean,
) : Promise<ObjectId> => {
	const MusicsIdsOfPlaylist = await GetAndAddMusicOfDeezerPlaylist(PlaylistDzId);
	const pId = await CreatePlaylist(PlaylistName, MusicsIdsOfPlaylist, UserId, IsPublic);
	return pId;
};

export {
	SearchAndAddMusicsDeezer,
	ConstructPlaylistFromDz,
	CreatePlaylist,
};
