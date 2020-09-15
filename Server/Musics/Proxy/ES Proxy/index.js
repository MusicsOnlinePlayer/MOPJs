const { EsArtistSearch } = require('./Artist');
const { EsAlbumSearch } = require('./Albums');
const { EsPlaylistSearch } = require('./Playlist');
const { EsMusicSearch, RefreshEsMusicIndex } = require('./Musics');

module.exports = {
	EsArtistSearch,
	EsAlbumSearch,
	EsMusicSearch,
	EsPlaylistSearch,
	RefreshEsMusicIndex,
};
