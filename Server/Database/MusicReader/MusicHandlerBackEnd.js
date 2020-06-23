const fs = require('fs');
const path = require('path');
const MopConsole = require('../../Tools/MopConsole');
const {
	Music, Album, Artist, User, esClient,
} = require('../Models');
const { ArtistsImageFolder } = require('./Utils');

/** Use this function to force refresh indices on es
 * Use it after adding data to es so that search results are up to date.
 */
const RefreshMusicIndex = () => new Promise((resolve, reject) => {
	esClient.indices.refresh({ index: 'musics' }, (err) => {
		if (err) {
			reject(err);
			return;
		}
		resolve();
	});
});

/** This function performs a save on MongoDB.
 *  The promise is resolved when the document is indexed in elastic search
 * @deprecated
 * @param {Music} MyMusicModel - The music that need to be saved
 * */
const SaveAndIndex = (MyMusicModel) => new Promise((resolve) => {
	MyMusicModel.save((err, savedModel) => {
		if (err) throw err;

		MyMusicModel.on('es-indexed', (ErrorEs) => {
			if (ErrorEs) throw ErrorEs;

			resolve(savedModel);
		});
	});
});

/** This function performs a save of music in the database while adding
 * new artist if it doesn't already exists and also adding a new album if it doesn't already exists.
 * @param {object} MusicTags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicTags.Title - Title of the music
 * @param {number=} MusicTags.DeezerId - Deezer Id
 * @param {string} MusicTags.Artist - Artist Name
 * @param {number=} MusicTags.ArtistDzId - Deezer Id of the music Artist
 * @param {string} MusicTags.Album - Album Name
 * @param {string=} MusicTags.Image - Cover of album in base64
 * @param {string=} MusicTags.ImagePathDeezer - url or path of album cover on deezer
 * @param {string=} MusicTags.ImageFormat - Format of the base64 image
 * @param {string=} ArtistImage - The path of the Artist image
 * @param {boolean} [EnableEsIndexWait=false] - This option indicate if it should wait for
 * ElasticSearch index before moving on (deprecated)
 * */
async function AddMusicToDatabase(MusicTags, ArtistImage = undefined, EnableEsIndexWait = false) {
	let guessedPath = `${MusicTags.Artist}.jpg`;

	if (!fs.existsSync(path.join(ArtistsImageFolder, guessedPath))) { guessedPath = undefined; }

	const NewTagsForAlbum = {
		Name: MusicTags.Album,
		DeezerId: MusicTags.AlbumDzId,
		Image: MusicTags.Image,
		ImagePathDeezer: MusicTags.ImagePathDeezer,
		ImageFormat: MusicTags.ImageFormat,
	};

	const NewTagsForMusicDocs = MusicTags;

	NewTagsForMusicDocs.Image = undefined;
	NewTagsForMusicDocs.ImagePathDeezer = undefined;
	NewTagsForMusicDocs.ImageFormat = undefined;


	const newMusic = new Music(NewTagsForMusicDocs);
	const newAlbum = new Album(NewTagsForAlbum);
	const newArtist = new Artist({
		Name: MusicTags.Artist,
		DeezerId: MusicTags.ArtistDzId,
		ImagePath: ArtistImage || guessedPath,
	});

	let musicDoc;

	try {
		musicDoc = EnableEsIndexWait ? await SaveAndIndex(newMusic) : await newMusic.save();
	} catch (err) {
		MopConsole.error('Music.Handler.BackEnd.Index', err);
		return;
	}

	const albumDoc = await Album.findOneOrCreate({
		Name: newAlbum.Name, $or: [{ DeezerId: newAlbum.DeezerId }, { DeezerId: undefined }],
	}, newAlbum);
	const artistDoc = await Artist.findOneOrCreate({ Name: newArtist.Name }, newArtist);


	albumDoc.DeezerId = newAlbum.DeezerId;
	artistDoc.DeezerId = newArtist.DeezerId;

	albumDoc.MusicsId.push(musicDoc._id);
	const savedAlbum = await albumDoc.save();
	if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
		MopConsole.info('Music.Handler.BackEnd.Index', `Added ${savedAlbum.Name}`);
		artistDoc.AlbumsId.push(savedAlbum);
		await artistDoc.save();
	}
}

/** This function performs an update directly on the database to change the track number
 * @param {object} tags - Tags of the music that need to change music id
 * @param {number} tags.DeezerId - The deezer id of the current music
 * @param {number} tags.TrackNumber - The new track number
 */
const UpdateIfNeededTrackNumber = (tags) => new Promise((resolve) => {
	MopConsole.info('Music.Handler.BackEnd', `Updated Track Number of music with dzId ${tags.DeezerId} to ${tags.TrackNumber}`);
	Music.findOneAndUpdate({ DeezerId: tags.DeezerId }, { TrackNumber: tags.TrackNumber })
		.then(() => {
			// console.log(`[Music Indexer] Update track number of ${tags.Title}`);
			resolve();
		});
});

/** This function add a new music to an existing album. It will also create and save the music
 * @param {object} tags - Tags for the music that will be saved
 * @param {number} AlbumDzId - Deezer id of the album
 */
const AppendMusicToAlbum = async (tags, AlbumDzId) => {
	const newMusic = new Music(tags);
	const savedMusic = await newMusic.save();
	const albumDoc = await Album.findOne({ Name: tags.Album, DeezerId: AlbumDzId });
	albumDoc.MusicsId.push(savedMusic._id);
	await albumDoc.save();
	MopConsole.info('Music.Handler.BackEnd.Index', `Added new music to ${albumDoc.Name}`);
};

/** This function decide if a music should be added to an album or just
 * need it's track number to be modified
 * @param {object} tags - Tags of the music
 * @param {number} AlbumDzId - Deezer id of the album
*/
async function AppendOrUpdateMusicToAlbum(tags, AlbumDzId) {
	const count = await Music.countDocuments({ Title: tags.Title });
	if (count > 0) {
		await UpdateIfNeededTrackNumber(tags);
	} else {
		await AppendMusicToAlbum(tags, AlbumDzId);
	}
}

/** This function performs an artist search and will add all albums specified if it is unique
 * @param {number} ArtistDzId - The Deezer Id of the Artist
 * @param {[object]} Albums - All the albums of the artist that need to be added
 */
async function AppendAlbumsToArtist(ArtistDzId, Albums) {
	const artistDoc = await Artist.findOne({ DeezerId: ArtistDzId });
	await artistDoc.populate('AlbumsId').execPopulate();

	const AlbumTasks = [];

	Albums.forEach((AlbumElement) => {
		if (!artistDoc.AlbumsId.some((e) => e.Name === AlbumElement.Name)) {
			AlbumTasks.push(new Promise((resolve) => {
				const AlbumDoc = new Album({
					Name: AlbumElement.Name,
					DeezerId: AlbumElement.DeezerId,
					ImagePathDeezer: AlbumElement.ImagePathDeezer,
				});

				Album.findOneOrCreate({ Name: AlbumDoc.Name, DeezerId: AlbumDoc.DeezerId }, AlbumDoc)
					.then((newAlbum) => {
						artistDoc.AlbumsId.push(newAlbum._id);
						MopConsole.info('Album.Handler.BackEnd.Index', `Added ${AlbumDoc.Name} to artist with dzId ${ArtistDzId}`);
						resolve();
					})
					.catch((err) => {
						MopConsole.error('Album.Handler.BackEnd.Index', err);
						resolve();
					});
			}));
		}
	});


	await Promise.all(AlbumTasks);

	await artistDoc.save();
	MopConsole.info('Artist.Handler.BackEnd.Index', `Saved ${AlbumTasks.length} albums`);
}

/** This function modify album states by modifying the IsComplete attribute
 * @param {number} AlbumDzId - Deezer id of the completed album
 */
async function UpdateAlbumCompleteStatus(AlbumDzId) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
}

/** This function perform an update on the database by modifying the ImagePathDeezer attributes.
 * It will add album cover coming from deezer
 * @param {Number} AlbumDzId - The Deezer id of the album that need a new cover
 * @param {string} ImagePathDeezer - The path or url of the album cover coming from deezer.
*/
async function AppendDzCoverToAlbum(AlbumDzId, ImagePathDeezer) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { ImagePathDeezer });
}

/** This function perform an update on the database by modifying the ImagePath attributes.
 * It will add the picture of an artist.
 * @param {Number} ArtistDzId - The Deezer id of the artist that need a new picture
 * @param {string} ImagePath - The path or url of the picture.
*/
async function AppendDzImageToArtist(ArtistDzId, ImagePath) {
	await Artist.findOneAndUpdate({ DeezerId: ArtistDzId }, { ImagePath });
}

/** This function performs a search on the database for an album containing a specific music.
 * @param {object} MyMusic - Music
 * @param {string} MyMusic.Album - Name of the album
 * @param {ObjectId} MyMusic._id - MongoDB id
 * @return {Album} Album of the specified music
*/
async function FindAlbumContainingMusic(MyMusic) {
	const AlbumCandidates = await Album.find({ Name: MyMusic.Album });
	if (AlbumCandidates.length < 1) return AlbumCandidates[0];
	let finalAlbum;
	AlbumCandidates.forEach((AlbumDoc) => {
		finalAlbum = AlbumDoc.MusicsId.find((id) => MyMusic._id.equals(id)) ? AlbumDoc : finalAlbum;
	});
	return finalAlbum;
}

/** Check if a music exist in the MongoDB database
 * @param {string} FilePath - Path of the music that need to be checked
 * @returns {boolean}
 */
const DoesMusicExists = async (FilePath) => {
	const count = await Music.countDocuments({ FilePath });
	return count > 0;
};

/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @returns {boolean}
 * @deprecated
 */
const DoesMusicExistsTitle = async (Title) => {
	const count = await Music.countDocuments({ Title });
	return count > 0;
};

/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @param {number} DeezerId - Deezer Id of the music that need to be checked
 * @returns {boolean}
 */
const DoesMusicExistsTitleDzId = async (Title, DeezerId) => {
	const count = await Music.countDocuments({ Title, DeezerId });
	return count > 0;
};

/** This function updates music path of a music
 * @param {number} DeezerId - Deezer Id of the music
 * @param {string} filePath - New music path of the music
 */
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

const GetMusicCount = () => new Promise((resolve, reject) => {
	Music.countDocuments()
		.then((count) => resolve(count))
		.catch((err) => reject(err));
});

/** This function increment like count on music as well as adding it to liked music of the user
 * if it is already like, then it will dislike the music to undo.
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 */
const LikeMusic = async (MusicId, UserId) => {
	const UserLikedMusic = await Music.findById(MusicId);

	const FoundUser = await User.findById(UserId);
	const index = FoundUser.LikedMusics.indexOf(UserLikedMusic._id);
	if (index === -1) {
		FoundUser.LikedMusics.push(UserLikedMusic._id);
		UserLikedMusic.Likes += 1;
	} else {
		FoundUser.LikedMusics.splice(index, 1);
		UserLikedMusic.Likes -= 1;
	}

	await UserLikedMusic.save();
	await FoundUser.save();
};

/** This function check if this particular music is like by a specified user
 * @param {ObjectId} MusicId - Music to like
 * @param {ObjectId} UserId - User who liked the music
 * @returns {boolean} Is music liked ?
 */
const CheckLikeMusic = async (MusicId, UserId) => {
	const FoundUser = await User.findById(UserId);
	const index = FoundUser.LikedMusics.indexOf(MusicId._id);
	return index !== -1;
};

/** This function gets liked musics of an user
 * @param {ObjectId} UserId - User who wants his liked musics
 */
const GetLikedMusics = async (UserId) => {
	const FoundUser = await User.findById(UserId).lean();
	return FoundUser.LikedMusics;
};

/** This function gets viewed musics of an user
 * @param {ObjectId} UserId - User who wants his viewed musics
 */
const GetViewedMusics = async (UserId) => {
	const FoundUser = await User.findById(UserId).lean();
	return FoundUser.ViewedMusics;
};


module.exports = {
	AddMusicToDatabase,
	AppendOrUpdateMusicToAlbum,
	UpdateAlbumCompleteStatus,
	AppendAlbumsToArtist,
	AppendDzCoverToAlbum,
	AppendDzImageToArtist,
	DoesMusicExists,
	DoesMusicExistsTitle,
	DoesMusicExistsTitleDzId,
	RegisterDownloadedFile,
	FindAlbumContainingMusic,
	GetMusicCount,
	LikeMusic,
	CheckLikeMusic,
	GetLikedMusics,
	GetViewedMusics,
	RefreshMusicIndex,
};
