const { DBArtistSearch } = require('./Artists');
const { DBAlbumSearch } = require('./Albums');
const { DBPlaylistSearch } = require('./Playlists');
const { DBMusicSearch } = require('./Musics');

module.exports = {
	DBMusicSearch,
	DBAlbumSearch,
	DBArtistSearch,
	DBPlaylistSearch,
};
