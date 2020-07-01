const { AppendOrUpdateMusicsToAlbum, HandleAlbumsFromDz } = require('../Proxy/DB Proxy');
const { GetMusicOfAlbum: GetMusicsOfAlbum } = require('../Proxy/Deezer Proxy/Musics');
const { GetAlbumsOfArtist } = require('../Proxy/Deezer Proxy');
const { ConvertTagsFromDz } = require('../Tags');
const { Downloader } = require('../Proxy/Downloader Proxy');

async function CompleteAlbum(AlbumDoc) {
	const DzMusics = await GetMusicsOfAlbum(AlbumDoc.DeezerId);

	const DzMusicsFormatted = DzMusics.map(
		(DzMusic) => ConvertTagsFromDz(DzMusic, AlbumDoc.DeezerId),
	);
	await AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);
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
};
