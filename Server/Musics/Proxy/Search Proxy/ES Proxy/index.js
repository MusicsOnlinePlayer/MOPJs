const { EsArtistSearch } = require('./Artists');
const { EsAlbumSearch } = require('./Albums');
const { EsPlaylistSearch } = require('./Playlists');
const { EsMusicSearch, RefreshEsMusicIndex } = require('./Musics');
// TODO Bulk for es searches
module.exports = {
	EsArtistSearch,
	EsAlbumSearch,
	EsMusicSearch,
	EsPlaylistSearch,
	RefreshEsMusicIndex,
};
