const { EsArtistSearch } = require('./Artist');
const { EsAlbumSearch } = require('./Albums');
const { EsMusicSearch, RefreshEsMusicIndex } = require('./Musics');

module.exports = {
	EsArtistSearch,
	EsAlbumSearch,
	EsMusicSearch,
	RefreshEsMusicIndex,
};
