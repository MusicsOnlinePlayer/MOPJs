const { EsArtistSearch } = require('./Artists');
const { EsAlbumSearch } = require('./Albums');
const { EsPlaylistSearch } = require('./Playlists');
const { EsMusicSearch, RefreshEsMusicIndex } = require('./Musics');

module.exports = {
	EsArtistSearch,
	EsAlbumSearch,
	EsMusicSearch,
	EsPlaylistSearch,
	RefreshEsMusicIndex,
};
