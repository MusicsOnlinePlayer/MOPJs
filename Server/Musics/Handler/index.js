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

const SearchAndAddMusicsDeezer = async (Query) => {
	const searchRes = await SearchMusics(Query);
	await AddMusicsFromDeezer(searchRes);
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
