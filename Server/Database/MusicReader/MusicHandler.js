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
} = require('./MusicHandlerBackEnd');

const HandleNewMusicFromDisk = async (tags, MusicFilePath) => {
	if (await DoesMusicExistsTitle(tags.title)) return;

	await AddMusicToDatabase(ConvertTagsFromDisc(tags, MusicFilePath));
};

const HandleNewMusicFromDz = async (tags) => {
	if (await DoesMusicExistsTitle(tags.title)) return;

	await AddMusicToDatabase(ConvertTagsFromDz(tags, tags.id), tags.artist.picture_big, true);
};

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

const HandleAlbumsFromDz = async (ArtistId, DeezerData) => {
	const Albums = [];
	DeezerData.forEach((album) => {
		Albums.push({ Name: album.title, DeezerId: album.id, ImagePathDeezer: album.cover_big });
	});
	await AppendAlbumsToArtist(ArtistId, Albums);
	MopConsole.info('Music Handler', 'Added albums to artist');
};

const HandleNewCoverFromDz = (AlbumDzId, DeezerData) => new Promise((resolve) => {
	AppendDzCoverToAlbum(AlbumDzId, DeezerData.cover_big)
		.then(() => {
			MopConsole.info('Music Handler', 'Added cover to album');
			resolve();
		});
});

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
};
