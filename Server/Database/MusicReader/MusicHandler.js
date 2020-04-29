const { Music } = require('../Models');
const { ConvertTagsFromDisc, ConvertTagsFromDz } = require('./Tags');
const {
	AddMusicToDatabase, AppendOrUpdateMusicToAlbum, UpdateAlbumCompleteStatus, AppendAlbumsToArtist,
} = require('./MusicHandlerBackEnd');

const HandleNewMusicFromDisk = async (tags, MusicFilePath) => {
	const count = await Music.countDocuments({ Title: tags.title });
	if (count > 0) return;

	await AddMusicToDatabase(ConvertTagsFromDisc(tags, MusicFilePath));
};

const HandleNewMusicFromDz = async (tags) => {
	const count = await Music.countDocuments({ Title: tags.title });
	if (count > 0) return;

	await AddMusicToDatabase(ConvertTagsFromDz(tags, tags.id), tags.artist.picture_big);
};

const HandleMusicsFromDz = async (MusicsTags, AlbumName, AlbumDzId, AlbumCoverPath) => {
	const musicTasks = [];
	MusicsTags.forEach((element) => {
		musicTasks.push(
			AppendOrUpdateMusicToAlbum(
				ConvertTagsFromDz(element, element.id, AlbumName, AlbumDzId, AlbumCoverPath),
			),
		);
	});
	await Promise.all(musicTasks);
	console.log('[Music Handler] Musics have been added / updated');
	await UpdateAlbumCompleteStatus(AlbumDzId);
	console.log('[Music Handler] Marked this album as complete');
};

const HandleAlbumsFromDz = async (ArtistId, DeezerData) => {
	const Albums = [];
	DeezerData.forEach((album) => {
		Albums.push({ Name: album.title, DeezerId: album.id });
	});
	await AppendAlbumsToArtist(ArtistId, Albums);
	console.log('[Music Handler] Added albums to artist');
};

const RegisterDownloadedFile = (DeezerId, filePath) => new Promise((resolve, reject) => {
	Music.findOne({ DeezerId })
		.then(async (doc) => {
			const musicDeezerDB = doc;
			musicDeezerDB.FilePath = filePath;
			await musicDeezerDB.save();
			resolve();
		})
		.catch((err) => {
			reject(err);
		});
});


module.exports = {
	HandleNewMusicFromDisk,
	HandleNewMusicFromDz,
	RegisterDownloadedFile,
	HandleMusicsFromDz,
	HandleAlbumsFromDz,
};
