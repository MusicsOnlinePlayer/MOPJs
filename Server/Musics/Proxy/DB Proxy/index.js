const { FindAlbumContainingMusic, HandleAlbumsFromDz } = require('./Albums');
const {
	AppendOrUpdateMusicsToAlbum, DoesMusicExistsTitle, DoesMusicExistsTitleDzId, AddMusicToDatabase,
} = require('./Musics');
const { ConvertTagsFromDisk, ConvertTagsFromDz } = require('../../Tags');

/** This function add a new music with tags coming from ID3 file.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicFilePath
 */
const HandleNewMusicFromDisk = async (tags, MusicFilePath) => {
	if (await DoesMusicExistsTitle(tags.title)) return;

	await AddMusicToDatabase(ConvertTagsFromDisk(tags, MusicFilePath));
};

/** This function add a new music with tags coming from deezer API.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 */
const HandleNewMusicFromDz = async (tags) => {
	if (await DoesMusicExistsTitleDzId(tags.title, tags.id)) return;

	await AddMusicToDatabase(ConvertTagsFromDz(tags, tags.id), tags.artist.picture_big);
};

module.exports = {
	FindAlbumContainingMusic,
	HandleAlbumsFromDz,
	AppendOrUpdateMusicsToAlbum,
	HandleNewMusicFromDisk,
	HandleNewMusicFromDz,
};
