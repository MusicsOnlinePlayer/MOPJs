const MopConsole = require('../../Tools/MopConsole');

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
function ConvertTags(
	tags,
	DeezerId, CustomAlbumName = undefined, CustomAlbumDzId = undefined, CustomCoverPath = undefined,
) {
	if (!tags.album) {
		MopConsole.warn('Music.Handler.Tags.Deezer', `Found empty album for track ${tags.title} - Deezer id ${DeezerId}`);
		if (!CustomCoverPath) {
			MopConsole.warn('Music.Handler.Tags.Deezer', 'And no custom cover path provided');
		}
		MopConsole.warn('Music.Handler.Tags.Deezer', `Additional args provided - CustomAlbumName: ${CustomAlbumName} CustomAlbumDzId: ${CustomAlbumDzId} CustomCoverPath: ${CustomCoverPath}`);
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

function ConvertTagsFromDzAlbum(tags, AlbumName, AlbumDzId) {
	const MusicTags = {
		Title: tags.title,
		Album: AlbumName,
		AlbumDzId,
		Artist: tags.artist.name,
		ArtistDzId: tags.artist.id,
		PublishedDate: Date.now(),
		TrackNumber: tags.track_position || 0,
		DeezerId: tags.id,
	};

	return MusicTags;
}

module.exports = {
	ConvertTags,
	ConvertTagsFromDzAlbum,
};
