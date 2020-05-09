const fs = require('fs');
const mm = require('musicmetadata');
const MopConsole = require('../../Tools/MopConsole');

/** This function retreives ID3 tags of a music
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
 * @param {string} MusicFilePath - Path of the music
 */
function ConvertTagsFromDisc(tags, MusicFilePath) {
	const { birthtime } = fs.statSync(MusicFilePath);
	const doctags = {
		Title: tags.title,
		Album: tags.album,
		Artist: tags.artist[0],
		PublishedDate: birthtime,
		TrackNumber: tags.track.no,
		FilePath: MusicFilePath,
		Image: tags.picture[0] ? tags.picture[0].data.toString('base64') : '',
		ImageFormat: tags.picture[0] ? tags.picture[0].format : '',
	};
	return doctags;
}
/** This function normalize tags coming from Deeezer
 * @param {object} tags - Tags coming from Deezer
 * @param {number} DeezerId - Deezer id of the music
 * @param {string=} CustomAlbumName - Override Album name contained in tags
 * @param {number=} CustomAlbumDzId - Override Deezer Id of album contained in tags
 * @param {string=} CustomCoverPath - Override Cover Path of album contained in tags
 * @return {object} Normalize tags, ready to be saved in MongoDB
 * */
function ConvertTagsFromDz(
	tags,
	DeezerId, CustomAlbumName = undefined, CustomAlbumDzId = undefined, CustomCoverPath = undefined,
) {
	if (!tags.album) {
		MopConsole.warn('Tags - Deezer', `Found empty album for track ${tags.title} - Deezer id ${DeezerId}`);
		if (!CustomCoverPath) {
			MopConsole.warn('Tags - Deezer', 'And no custom cover path provided');
		}
		MopConsole.warn('Tags - Deezer', `Additional args provided - CustomAlbumName: ${CustomAlbumName} CustomAlbumDzId: ${CustomAlbumDzId}`);
	}

	const doctags = {
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
	return doctags;
}

module.exports = {
	ConvertTagsFromDisc,
	ConvertTagsFromDz,
	ReadTags,
};
