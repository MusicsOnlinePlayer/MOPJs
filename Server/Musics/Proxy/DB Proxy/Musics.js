const fs = require('fs');
const path = require('path');
const MopConsole = require('../../../Tools/MopConsole');
const { Music, Album, Artist } = require('../../Model');
const { ArtistsImageFolder } = require('../../Config');

const LogLocation = 'Musics.Proxy.DB Proxy.Musics';

/** This function performs an update directly on the database to change the track number
 * @param {object} tags - Tags of the music that need to change music id
 * @param {number} tags.DeezerId - The deezer id of the current music
 * @param {number} tags.TrackNumber - The new track number
 */
const UpdateIfNeededTrackNumber = (tags) => new Promise((resolve) => {
	MopConsole.info(LogLocation, `Updated Track Number of music with dzId ${tags.DeezerId} to ${tags.TrackNumber}`);
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
	const albumDoc = await Album.findOne({ Name: tags.Album, DeezerId: AlbumDzId });

	const savedMusic = await Music.create({ ...tags, AlbumId: albumDoc._id });
	albumDoc.MusicsId.push(savedMusic._id);
	await albumDoc.save();

	MopConsole.info(LogLocation, `Added new music to ${albumDoc.Name}`);
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

/** This function decide if multiple musics should be added to an album or just
 * need it's track number to be modified
 * @param {object[]} MusicsTags - An array of Music tags
 * @param {number} AlbumDzId - Deezer id of the album
*/
async function AppendOrUpdateMusicsToAlbum(MusicsTags, AlbumDzId) {
	const Tasks = [];
	MusicsTags.forEach((MusicTags) => {
		Tasks.push(AppendOrUpdateMusicToAlbum(MusicTags, AlbumDzId));
	});
	MopConsole.debug(LogLocation, `Adding or updating ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
	try {
		await Promise.all(Tasks);
	} catch (err) {
		MopConsole.error(LogLocation, err);
	}
	MopConsole.debug(LogLocation, `Added or updated ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
}

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
 * @returns {Promise<string>} Music db id of the music saved
 * */
async function AddMusicToDatabase(MusicTags, ArtistImage = undefined) {
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
		musicDoc = await newMusic.save();
	} catch (err) {
		MopConsole.error(LogLocation, err);
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
		MopConsole.info(LogLocation, `Added ${savedAlbum.Name}`);
		artistDoc.AlbumsId.push(savedAlbum);
		await artistDoc.save();
	}

	musicDoc.AlbumId = savedAlbum._id;
	await musicDoc.save();
	/* eslint consistent-return: "off" */
	return musicDoc._id;
}

module.exports = {
	AppendOrUpdateMusicsToAlbum,
	DoesMusicExistsTitle,
	AddMusicToDatabase,
	DoesMusicExistsTitleDzId,
};
