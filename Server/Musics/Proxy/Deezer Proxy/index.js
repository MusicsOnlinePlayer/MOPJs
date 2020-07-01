const { SearchMusics } = require('./Search');
const { GetMusicOfAlbum } = require('./Musics');
const { GetAlbumsOfArtist } = require('./Albums');
const { GetImageOfArtist } = require('./Artists');

module.exports = {
	SearchMusics,
	GetMusicOfAlbum,
	GetAlbumsOfArtist,
	GetImageOfArtist,
};
