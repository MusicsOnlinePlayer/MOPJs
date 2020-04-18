const MusicModel = require('./Music').Music;
const AlbumModel = require('./Music').Album;
const ArtistModel = require('./Music').Artist;

module.exports = {
	Music: MusicModel,
	Album: AlbumModel,
	Artist: ArtistModel,
};
