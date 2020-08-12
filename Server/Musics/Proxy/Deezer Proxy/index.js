const { SearchMusics } = require('./Search');
const { GetMusicOfAlbum } = require('./Musics');
const { GetAlbumsOfArtist, GetCoverPathOfAlbum } = require('./Albums');
const { GetImageOfArtist } = require('./Artists');
const { CheckIfDeezerReqAreAllowed } = require('./Misc');

module.exports = {
	SearchMusics,
	GetMusicOfAlbum,
	GetAlbumsOfArtist,
	GetImageOfArtist,
	GetCoverPathOfAlbum,
	CheckIfDeezerReqAreAllowed,
};
