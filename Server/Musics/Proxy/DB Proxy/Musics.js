const MopConsole = require('../../../Tools/MopConsole');
const { Music, Album } = require('../../../Database/Models');

const LogLocation = 'Musics.Proxy.DBProxy.Musics';

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
	const newMusic = new Music(tags);
	const savedMusic = await newMusic.save();
	const albumDoc = await Album.findOne({ Name: tags.Album, DeezerId: AlbumDzId });
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
	await Promise.all(Tasks);
	MopConsole.debug(LogLocation, `Added or updated ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
}

module.exports = {
	AppendOrUpdateMusicsToAlbum,
};
