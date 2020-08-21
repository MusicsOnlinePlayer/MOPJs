const {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	HandlePlaylistRequestById,
	GetMusicFilePath,
	IncrementLikeCount,
	MakeIndexation,
	AddMusicsFromDeezer,
} = require('./DBHandler');

const {
	SearchMusics,
} = require('./DeezerHandler');
const { RefreshEsMusicIndex } = require('../Proxy/ES Proxy');
const { GetMusicsOfPlaylist } = require('../Proxy/Deezer Proxy/Playlist');
const { CreatePlaylist } = require('../Proxy/DB Proxy/Playlist');

const SearchAndAddMusicsDeezer = async (Query) => {
	const searchRes = await SearchMusics(Query);
	await AddMusicsFromDeezer(searchRes);
	await RefreshEsMusicIndex();
};

/** Retrieve musics of a specified deezer playlist and add musics to db id
 * @param {number} PlaylistDzId deezer id of a deezer playlist
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
const GetAndAddMusicOfDeezerPlaylist = async (PlaylistDzId) => {
	const dzMusics = await GetMusicsOfPlaylist(PlaylistDzId);
	return await AddMusicsFromDeezer(dzMusics);
};

const ConstructPlaylistFromDz = async (PlaylistDzId, PlaylistName, UserId, IsPublic) => {
	const MusicsIdsOfPlaylist = await GetAndAddMusicOfDeezerPlaylist(PlaylistDzId);
	const pId = await CreatePlaylist(PlaylistName, MusicsIdsOfPlaylist, UserId, IsPublic);
	return pId;
};


module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	HandlePlaylistRequestById,
	GetMusicFilePath,
	IncrementLikeCount,
	MakeIndexation,
	SearchAndAddMusicsDeezer,
	ConstructPlaylistFromDz,
	CreatePlaylist,
};
