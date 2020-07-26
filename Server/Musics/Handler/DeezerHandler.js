const { AppendOrUpdateMusicsToAlbum, HandleAlbumsFromDz, UpdateAlbumCompleteStatus } = require('../Proxy/DB Proxy');
const { GetMusicOfAlbum: GetMusicsOfAlbum } = require('../Proxy/Deezer Proxy/Musics');
const { GetAlbumsOfArtist, SearchMusics } = require('../Proxy/Deezer Proxy');
const { ConvertTagsFromDz } = require('../Tags');
const { Downloader } = require('../Proxy/Downloader Proxy');

async function CompleteAlbum(AlbumDoc) {
	const DzMusics = await GetMusicsOfAlbum(AlbumDoc.DeezerId);

	const DzMusicsFormatted = DzMusics.map(
		(DzMusic) => ConvertTagsFromDz(
			DzMusic,
			DzMusic.id,
			AlbumDoc.Name,
			AlbumDoc.DeezerId,
			AlbumDoc.ImagePathDeezer,
		),
	);

	await AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);

	await UpdateAlbumCompleteStatus(AlbumDoc.DeezerId);
}

async function CompleteArtist(ArtistDoc) {
	const DzAlbums = await GetAlbumsOfArtist(ArtistDoc.DeezerId);
	await HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
}

async function GetMusicFilePath(MusicDeezerId) {
	return await Downloader.AddToQueueAsync(MusicDeezerId);
}

module.exports = {
	CompleteAlbum,
	CompleteArtist,
	GetMusicFilePath,
	SearchMusics,
};
