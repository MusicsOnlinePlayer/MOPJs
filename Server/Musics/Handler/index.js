const {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
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

module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
	IncrementLikeCount,
	MakeIndexation,
	SearchAndAddMusicsDeezer,
	GetAndAddMusicOfDeezerPlaylist,
};
