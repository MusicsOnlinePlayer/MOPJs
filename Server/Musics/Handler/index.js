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

const SearchAndAddMusicsDeezer = async (Query) => {
	const searchRes = await SearchMusics(Query);
	await AddMusicsFromDeezer(searchRes);
	await RefreshEsMusicIndex();
};

module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
	IncrementLikeCount,
	MakeIndexation,
	SearchAndAddMusicsDeezer,
};
