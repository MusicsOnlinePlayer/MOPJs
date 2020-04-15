const path = require('path');

const MusicsFolder = path.join(__dirname, './../../../MusicsFolderProd');
const ArtistsImageFolder = path.join(__dirname, './../../../ArtistImages');
const fs = require('fs');
const NodeID3 = require('node-id3');
var ArtistModel = require('./../Models').Artist;

var MusicModel = require('./../Models').Music;
var AlbumModel = require('./../Models').Album;

module.exports = {
	MusicsFolder,
	ArtistsImageFolder,
	ReadAllMusics: () => {
		return new Promise((resolver, reject) => {
			Indexation();
		});
	},
};

Indexation = async () => {
	console.log('[Music Indexer] Starting indexing');
	console.time('[Music Indexer] Time ');

	let files = fs.readdirSync(MusicsFolder);
	for (const file of files) {
		let MusicFilePath = path.join(MusicsFolder, path.basename(file));

		let count = await MusicModel.countDocuments({ FilePath: MusicFilePath });

		if (count == 0) {
			let tags = NodeID3.read(MusicFilePath);
			if (tags.title && tags.album && tags.artist && tags.trackNumber) {
				await HandleNewMusic(tags, MusicFilePath);
			}
		}
	}
	console.log('[Music Indexer] Done');
	console.timeEnd('[Music Indexer] Time ');
};

HandleNewMusic = async (tags, MusicFilePath) => {
	let NewTrackNumber = parseInt(tags.trackNumber.split('/')[0], 10);

	let doctags = {
		Title: tags.title,
		Album: tags.album,
		Artist: tags.artist,
		TrackNumber: NewTrackNumber,
		FilePath: MusicFilePath,
		Image: tags.image ? tags.image.imageBuffer.toString('base64') : '',
	};

	let guessedPath = path.join(ArtistsImageFolder, doctags.Artist + '.jpg');
	imagePath = guessedPath;

	var newMusic = new MusicModel(doctags);
	var newArtist = new ArtistModel({ Name: doctags.Artist, ImagePath: guessedPath });
	var newAlbum = new AlbumModel({ Name: doctags.Album });

	let musicDoc = await newMusic.save();

	let artistDoc = await ArtistModel.findOneOrCreate({ Name: newArtist.Name }, newArtist);

	let albumDoc = await AlbumModel.findOneOrCreate({ Name: newAlbum.Name }, newAlbum);

	albumDoc.MusicsId.push(musicDoc._id);
	let savedAlbum = await albumDoc.save();

	if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
		console.log('[Music Indexer] Added ' + savedAlbum.Name);
		artistDoc.AlbumsId.push(savedAlbum);
		await artistDoc.save();
	}
};
