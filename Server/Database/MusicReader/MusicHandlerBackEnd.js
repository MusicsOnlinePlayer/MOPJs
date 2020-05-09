const fs = require('fs');
const path = require('path');
const MopConsole = require('../../Tools/MopConsole');
const { Music, Album, Artist } = require('../Models');
const { ArtistsImageFolder } = require('./Utils');

/** This function performs a save on MongoDB.
 *  The promise is resolved when the document is indexed in elastic search
 * @param {Music} MyMusicModel - The music that need to be saved
 * */
const SaveAndIndex = (MyMusicModel) => new Promise((resolve) => {
	MyMusicModel.save((err, savedModel) => {
		if (err) throw err;

		MyMusicModel.on('es-indexed', (erres) => {
			if (erres) throw erres;

			resolve(savedModel);
		});
	});
});

/** This function performs a save of music in the database while adding
 * new artist if it doesn't already exists and also adding a new album if it doesn't already exists.
 * @param {object} doctags - All tags about the music (see Tags.js for more details)
 * @param {string} doctags.Title - Title of the music
 * @param {number=} doctags.DeezerId - Deezer Id
 * @param {string} doctags.Artist - Artist Name
 * @param {number=} doctags.ArtistDzId - Deezer Id of the music Artist
 * @param {string} doctags.Album - Album Name
 * @param {string=} doctags.Image - Cover of album in base64
 * @param {string=} doctags.ImagePathDeezer - url or path of album cover on deezer
 * @param {string=} doctags.ImageFormat - Format of the base64 image
 * @param {string=} ArtistImage - The path of the Artist image
 * @param {boolean} [EnableEsIndexWait=false] - This option indicate if it should wait for
 * ElasticSearch index before moving on
 * */
async function AddMusicToDatabase(doctags, ArtistImage = undefined, EnableEsIndexWait = false) {
	let guessedPath = `${doctags.Artist}.jpg`;

	if (!fs.existsSync(path.join(ArtistsImageFolder, guessedPath))) { guessedPath = undefined; }

	const NewTagsForAlbum = {
		Name: doctags.Album,
		DeezerId: doctags.AlbumDzId,
		Image: doctags.Image,
		ImagePathDeezer: doctags.ImagePathDeezer,
		ImageFormat: doctags.ImageFormat,
	};

	const NewTagsForMusicDocs = doctags;

	NewTagsForMusicDocs.Image = undefined;
	NewTagsForMusicDocs.ImagePathDeezer = undefined;
	NewTagsForMusicDocs.ImageFormat = undefined;


	const newMusic = new Music(NewTagsForMusicDocs);
	const newAlbum = new Album(NewTagsForAlbum);
	const newArtist = new Artist({
		Name: doctags.Artist,
		DeezerId: doctags.ArtistDzId,
		ImagePath: ArtistImage || guessedPath,
	});

	let musicDoc;

	try {
		musicDoc = EnableEsIndexWait ? await SaveAndIndex(newMusic) : await newMusic.save();
	} catch (err) {
		MopConsole.error('Music - Indexer', err);
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
		MopConsole.info('Music - Indexer', `Added ${savedAlbum.Name}`);
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
	MopConsole.info('Music - Handler', `Updated tracknumber of music with dzId ${tags.DeezerId} to ${tags.TrackNumber}`);
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
	MopConsole.info('Music - Indexer', `Added new music to ${albumDoc.Name}`);
};

/** This function decide if a music should be added to an album or just
 * need it's tracknumber to be modified
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
						MopConsole.info('Music Handler', `Added ${AlbumDoc.Name} to artist with dzId ${ArtistDzId}`);
						resolve();
					})
					.catch((err) => {
						MopConsole.error('Music Handler', err);
						resolve();
					});
			}));
		}
	});


	await Promise.all(AlbumTasks);

	await artistDoc.save();
	MopConsole.info('Music Handler', `Saved ${AlbumTasks.length} albums`);
}

/** This function modify album states by modifying the IsComplete attribute
 * @param {number} AlbumDzId - Deezer id of the completed album
 */
async function UpdateAlbumCompleteStatus(AlbumDzId) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
}

/** This function perform an update on the database by modifying the ImagePathDeezer attributes.
 * It will add album cover comming from deezer
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
 * @param {string} FilePath - Title of the music that need to be checked
 * @returns {boolean}
 */
const DoesMusicExistsTitle = async (Title) => {
	const count = await Music.countDocuments({ Title });
	return count > 0;
};

/** This function updates filepath of a music
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

module.exports = {
	AddMusicToDatabase,
	AppendOrUpdateMusicToAlbum,
	UpdateAlbumCompleteStatus,
	AppendAlbumsToArtist,
	AppendDzCoverToAlbum,
	AppendDzImageToArtist,
	DoesMusicExists,
	DoesMusicExistsTitle,
	RegisterDownloadedFile,
	FindAlbumContainingMusic,
	GetMusicCount,
};
