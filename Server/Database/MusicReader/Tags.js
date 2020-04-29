const fs = require('fs');
const mm = require('musicmetadata');

const ReadTags = (filePath) => new Promise((resolve, reject) => {
	mm(fs.createReadStream(filePath), (err, meta) => {
		if (err) reject(err);
		resolve(meta);
	});
});

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

function ConvertTagsFromDz(
	tags,
	DeezerId, CustomAlbumName = undefined, CustomAlbumDzId = undefined, CustomCoverPath = undefined,
) {
	if (!tags.album) {
		console.log(`[Tags - Deezer] Found empty album for track ${tags.title} - Deezer id ${DeezerId}`);
		if (!CustomCoverPath) {
			console.log('[Tags - Deezer] And no custom cover path provided');
		}
		console.log(`[Tags - Deezer] Additional args provided - CustomAlbumName: ${CustomAlbumName} CustomAlbumDzId: ${CustomAlbumDzId}`);
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
