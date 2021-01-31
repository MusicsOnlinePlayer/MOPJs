import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';
import MopConsole from '../../../Tools/MopConsole';
import { Music, Album, Artist } from '../../Model';
import { ArtistsImageFolder } from '../../Config';
import {
	IAlbum, IArtist, IDeezerMusic, IMusic,
} from '../../Interfaces';

const LogLocation = 'Musics.Proxy.DB Proxy.Musics';

/** This function performs an update directly on the database to change the track number
 * @param {IMusic} tags - Tags of the music that need to change music id
 */
const UpdateIfNeededTrackNumber = (tags : IMusic) : Promise<void> => new Promise((resolve) => {
	MopConsole.info(LogLocation, `Updated Track Number of music with dzId ${tags.DeezerId} to ${tags.TrackNumber}`);
	Music.findOneAndUpdate({ DeezerId: tags.DeezerId }, { TrackNumber: tags.TrackNumber })
		.then(() => {
			// console.log(`[Music Indexer] Update track number of ${tags.Title}`);
			resolve();
		});
});

/** This function add a new music to an existing album. It will also create and save the music
 * @param {IMusic} tags - Tags for the music that will be saved
 * @param {number} AlbumDzId - Deezer id of the album
 */
const AppendMusicToAlbum = async (tags: IMusic, AlbumDzId : number) : Promise<void> => {
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
async function AppendOrUpdateMusicToAlbum(tags: IMusic, AlbumDzId: number) : Promise<void> {
	const count = await Music.countDocuments({ Title: tags.Title });
	if (count > 0) {
		await UpdateIfNeededTrackNumber(tags);
	} else {
		await AppendMusicToAlbum(tags, AlbumDzId);
	}
}

/** This function decide if multiple musics should be added to an album or just
 * need it's track number to be modified
 * @param {Array<IMusic>} MusicsTags - An array of Music tags
 * @param {number} AlbumDzId - Deezer id of the album
*/
export async function AppendOrUpdateMusicsToAlbum(
	MusicsTags: Array<IMusic>,
	AlbumDzId: number,
) : Promise<void> {
	const Tasks : Array<Promise<void>> = [];
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
export const DoesMusicExistsTitle = async (Title: string) : Promise<boolean> => {
	const count = await Music.countDocuments({ Title });
	return count > 0;
};

/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @param {number} DeezerId - Deezer Id of the music that need to be checked
 * @returns {Promise<boolean>}
 */
export const DoesMusicExistsTitleDzId = async (
	Title : string, DeezerId: number,
) : Promise<boolean> => {
	const count = await Music.countDocuments({ Title, DeezerId });
	return count > 0;
};

export const UpdateRanksBulk = async (
	tags: Array<IDeezerMusic>,
) : Promise<number> => {
	const bulk = Music.collection.initializeUnorderedBulkOp();
	tags.forEach((tag) => {
		bulk.find({ DeezerId: tag.id }).updateOne({ $set: { Rank: tag.rank } });
	});
	const bulkResult = await bulk.execute();
	return bulkResult.nModified;
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
export async function AddMusicToDatabase(
	music: IMusic,
	album: IAlbum,
	artist: IArtist,
	ArtistImage: string = undefined,
) : Promise<ObjectId> {
	let guessedPath = `${artist.Name}.jpg`;

	if (!fs.existsSync(path.join(ArtistsImageFolder, guessedPath))) { guessedPath = undefined; }

	const newMusic = new Music(music);
	const newAlbum = new Album(album);
	const newArtist = new Artist({
		...artist,
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
		artistDoc.AlbumsId.push(savedAlbum._id);
		await artistDoc.save();
	}

	musicDoc.AlbumId = savedAlbum._id;
	await musicDoc.save();
	/* eslint consistent-return: "off" */
	return musicDoc._id;
}
