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

const GetAndAddMusicOfDeezerPlaylist = async (PlaylistDzId) => {
	const dzMusics = await GetMusicsOfPlaylist(PlaylistDzId);
	await AddMusicsFromDeezer(dzMusics);
};

module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
	IncrementLikeCount,
	MakeIndexation,
	SearchAndAddMusicsDeezer,
	GetAndAddMusicOfDeezerPlaylist
};
