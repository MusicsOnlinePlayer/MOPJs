const path = require('path');

const MusicsFolder = path.join(__dirname, './../../../MusicsFolderProd');
const ArtistsImageFolder = path.join(__dirname, './../../../ArtistImages');
const fs = require('fs');
const NodeID3 = require('node-id3');
const ArtistModel = require('../Models').Artist;

const MusicModel = require('../Models').Music;
const AlbumModel = require('../Models').Album;

const HandleNewMusic = async (tags, MusicFilePath) => {
	const NewTrackNumber = parseInt(tags.trackNumber.split('/')[0], 10);

	if (isNaN(NewTrackNumber)) {
		console.warn(`[Music Indexer] Skipped because of track number - ${MusicFilePath}`);
		return;
	}

	const doctags = {
		Title: tags.title,
		Album: tags.album,
		Artist: tags.artist,
		TrackNumber: NewTrackNumber,
		FilePath: MusicFilePath,
		Image: tags.image ? tags.image.imageBuffer.toString('base64') : '',
	};

	const guessedPath = path.join(ArtistsImageFolder, `${doctags.Artist}.jpg`);

	const newMusic = new MusicModel(doctags);
	const newArtist = new ArtistModel({ Name: doctags.Artist, ImagePath: guessedPath });
	const newAlbum = new AlbumModel({ Name: doctags.Album });

	const musicDoc = await newMusic.save();

	const artistDoc = await ArtistModel.findOneOrCreate({ Name: newArtist.Name }, newArtist);

	const albumDoc = await AlbumModel.findOneOrCreate({ Name: newAlbum.Name }, newAlbum);

	albumDoc.MusicsId.push(musicDoc._id);
	const savedAlbum = await albumDoc.save();

	if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
		console.log(`[Music Indexer] Added ${savedAlbum.Name}`);
		artistDoc.AlbumsId.push(savedAlbum);
		await artistDoc.save();
	}
};

const Indexation = async () => {
	console.log('[Music Indexer] Starting indexing');
	console.time('[Music Indexer] Time ');

	const files = fs.readdirSync(MusicsFolder);
	/* eslint no-restricted-syntax: "off" */
	for (const file of files) {
		const MusicFilePath = path.join(MusicsFolder, path.basename(file));

		const count = await MusicModel.countDocuments({ FilePath: MusicFilePath });

		if (count === 0) {
			const tags = NodeID3.read(MusicFilePath);
			if (tags.title && tags.album && tags.artist && tags.trackNumber) {
				await HandleNewMusic(tags, MusicFilePath);
			}
		}
	}
	console.log('[Music Indexer] Done');
	console.timeEnd('[Music Indexer] Time ');
};


module.exports = {
	MusicsFolder,
	ArtistsImageFolder,
	ReadAllMusics: () => new Promise(() => {
		Indexation();
	}),
};
