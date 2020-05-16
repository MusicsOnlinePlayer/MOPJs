const { ConvertTagsFromDisc, ConvertTagsFromDz } = require('./Tags');
const MopConsole = require('../../Tools/MopConsole');
const {
	AddMusicToDatabase, AppendOrUpdateMusicToAlbum, UpdateAlbumCompleteStatus, AppendAlbumsToArtist,
	AppendDzCoverToAlbum,
	AppendDzImageToArtist,
	DoesMusicExistsTitle,
	RegisterDownloadedFile,
	DoesMusicExists,
	FindAlbumContainingMusic,
	GetMusicCount,
	LikeMusic,
	CheckLikeMusic,
} = require('./MusicHandlerBackEnd');

/** This function add a new music with tags coming from ID3 file.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicFilePath
 */
const HandleNewMusicFromDisk = async (tags, MusicFilePath) => {
	if (await DoesMusicExistsTitle(tags.title)) return;

	await AddMusicToDatabase(ConvertTagsFromDisc(tags, MusicFilePath));
};

/** This function add a new music with tags coming from deezer API.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 */
const HandleNewMusicFromDz = async (tags) => {
	if (await DoesMusicExistsTitle(tags.title)) return;

	await AddMusicToDatabase(ConvertTagsFromDz(tags, tags.id), tags.artist.picture_big, true);
};

/** This function add musics coming from deezer API to an existing Album.
 * This function run sequentially
 * @param {object} MusicsTags - All tags about the music (see Tags.js for more details)
 * @param {string} AlbumName - Name of the album (not unique)
 * @param {number} AlbumDzId - Deezer Id of the album (unique)
 * @param {string} AlbumCoverPath - Path of the album cover
 */
const HandleMusicsFromDz = async (MusicsTags, AlbumName, AlbumDzId, AlbumCoverPath) => {
	const musicTasks = [];
	MusicsTags.forEach((element) => {
		musicTasks.push(
			AppendOrUpdateMusicToAlbum(
				ConvertTagsFromDz(element, element.id, AlbumName, AlbumDzId, AlbumCoverPath),
				AlbumDzId,
			),
		);
	});
	await Promise.all(musicTasks);
	MopConsole.info('Music Handler', 'Musics have been added / updated');
	await UpdateAlbumCompleteStatus(AlbumDzId);
	MopConsole.info('Music Handler', 'Marked this album as complete');
};

/** This function add albums coming from deezer API to an existing artist.
 * This function run sequentially
 * @param {number} ArtistId - Deezer Id of the artist (unique)
 * @param {[object]} DeezerAlbums - List of albums details
 */
const HandleAlbumsFromDz = async (ArtistId, DeezerAlbums) => {
	const Albums = [];
	DeezerAlbums.forEach((album) => {
		Albums.push({ Name: album.title, DeezerId: album.id, ImagePathDeezer: album.cover_big });
	});
	await AppendAlbumsToArtist(ArtistId, Albums);
	MopConsole.info('Music Handler', 'Added albums to artist');
};

/** This function add a cover coming from deezer to an existing album with a deezer id
 * @param {number} AlbumDzId - Deezer Id of the album (unique)
 * @param {object} DeezerData - Details about the album coming from deezer API
 * @param {string} DeezerData.cover_big - Path of the album cover
 */
const HandleNewCoverFromDz = (AlbumDzId, DeezerData) => new Promise((resolve) => {
	AppendDzCoverToAlbum(AlbumDzId, DeezerData.cover_big)
		.then(() => {
			MopConsole.info('Music Handler', 'Added cover to album');
			resolve();
		});
});

/** This function add an image coming from deezer to an existing artist with a deezer id
 * @param {number} ArtistDzId - Deezer Id of the artist (unique)
 * @param {object} DeezerData - Details about the artist coming from deezer API
 * @param {string} DeezerData.picture_big - Path of the artist image
 */
const HandleNewImageFromDz = (ArtistDzId, DeezerData) => new Promise((resolve) => {
	AppendDzImageToArtist(ArtistDzId, DeezerData.picture_big)
		.then(() => {
			MopConsole.info('Music Handler', 'Added image to artist');
			resolve();
		});
});

module.exports = {
	HandleNewMusicFromDisk,
	HandleNewMusicFromDz,
	RegisterDownloadedFile,
	HandleMusicsFromDz,
	HandleAlbumsFromDz,
	HandleNewCoverFromDz,
	HandleNewImageFromDz,
	DoesMusicExists,
	FindAlbumContainingMusic,
	GetMusicCount,
	LikeMusic,
	CheckLikeMusic,
};
