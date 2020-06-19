const fs = require('fs');
const mm = require('musicmetadata');
const MopConsole = require('../../Tools/MopConsole');

/** This function retrieves ID3 tags of a music
 * @param {string} filePath - File path of the music
 */
const ReadTags = (filePath) => new Promise((resolve, reject) => {
	mm(fs.createReadStream(filePath), (err, meta) => {
		if (err) {
			reject(err);
			return;
		}

		resolve(meta);
	});
});

/** This function normalizes ID3 tags
 * @param {object} tags - ID3 tags
 * @param {string} tags.title - Name of the Music
 * @param {string} tags.album - Name of the album
 * @param {[string]} tags.artist - Artists of the Music
 * @param {object} tags.track - Details about the song
 * @param {number} tags.track.no - Track Position in the Album
 * @param {[object]} tags.picture - Covers of the song
 *
 * @param {string} MusicFilePath - Path of the music
 */
function ConvertTagsFromDisc(tags, MusicFilePath) {
	const { birthtime } = fs.statSync(MusicFilePath);
	const MusicTags = {
		Title: tags.title,
		Album: tags.album,
		Artist: tags.artist[0],
		PublishedDate: birthtime,
		TrackNumber: tags.track.no,
		FilePath: MusicFilePath,
		Image: tags.picture[0] ? tags.picture[0].data.toString('base64') : '',
		ImageFormat: tags.picture[0] ? tags.picture[0].format : '',
	};
	return MusicTags;
}
/** This function normalize tags coming from Deezer
 * @param {object} tags - Tags coming from Deezer
 * @param {string} tags.title - Music title
 * @param {object} tags.album - Album details
 * @param {string} tags.album.title - Album Title
 * @param {number} tags.album.id - Deezer Id of Album
 * @param {string} tags.album.cover_big - Album Cover Path
 * @param {object} tags.artist - Artist details
 * @param {string} tags.artist.name - Artist Name
 * @param {number} tags.artist.id - Deezer Id of Artist
 * @param {number} tags.track_position - Position of music in album
 *
 * @param {number} DeezerId - Deezer id of the music
 * @param {string=} CustomAlbumName - Override Album name contained in tags
 * @param {number=} CustomAlbumDzId - Override Deezer Id of album contained in tags
 * @param {string=} CustomCoverPath - Override Cover Path of album contained in tags
 *
 * @return {object} Normalize tags, ready to be saved in MongoDB
 * */
function ConvertTagsFromDz(
	tags,
	DeezerId, CustomAlbumName = undefined, CustomAlbumDzId = undefined, CustomCoverPath = undefined,
) {
	if (!tags.album) {
		MopConsole.warn('Music.Handler.Tags.Deezer', `Found empty album for track ${tags.title} - Deezer id ${DeezerId}`);
		if (!CustomCoverPath) {
			MopConsole.warn('Music.Handler.Tags.Deezer', 'And no custom cover path provided');
		}
		MopConsole.warn('Music.Handler.Tags.Deezer', `Additional args provided - CustomAlbumName: ${CustomAlbumName} CustomAlbumDzId: ${CustomAlbumDzId}`);
	}

	const MusicTags = {
		Title: tags.title,
		Album: CustomAlbumName || tags.album.title,
		AlbumDzId: CustomAlbumDzId || tags.album.id,
		Artist: tags.artist.name,
		ArtistDzId: tags.artist.id,
		PublishedDate: Date.now(),
		TrackNumber: tags.track_position || 0,
		ImagePathDeezer: CustomCoverPath || tags.album.cover_big,
		DeezerId,
	};
	return MusicTags;
}

module.exports = {
	ConvertTagsFromDisc,
	ConvertTagsFromDz,
	ReadTags,
};
