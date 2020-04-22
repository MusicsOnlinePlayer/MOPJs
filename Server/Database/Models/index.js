const MusicModel = require('./Music').Music;
const AlbumModel = require('./Music').Album;
const ArtistModel = require('./Music').Artist;
const UserModel = require('./User').User;
// TODO Use destructive sentence

module.exports = {
	Music: MusicModel,
	Album: AlbumModel,
	Artist: ArtistModel,
	User: UserModel,
};
