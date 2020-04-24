const path = require('path');

const MusicsFolder = path.join(__dirname, './../../../MusicsFolderProd');
const ArtistsImageFolder = path.join(__dirname, './../../../ArtistImages');
const fs = require('fs');
const mm = require('musicmetadata');
const ArtistModel = require('../Models').Artist;

const MusicModel = require('../Models').Music;
const AlbumModel = require('../Models').Album;

const AddMusicFromDeezer = (DeezerId, filePath) => new Promise((resolve, reject) => {
	MusicModel.findOne({ DeezerId })
		.then(async (doc) => {
			const musicDeezerDB = doc;
			musicDeezerDB.FilePath = filePath;
			await musicDeezerDB.save();
			resolve();
		})
		.catch((err) => {
			reject(err);
		});
});

const HandleNewMusic = async (tags, MusicFilePath, fromDeezer = false, DeezerId = undefined, ArtistImage = undefined) => {
	const count = await MusicModel.countDocuments({ Title: tags.title });

	if (count > 0) return;


	let doctags;

	if (!fromDeezer) {
		const { birthtime } = fs.statSync(MusicFilePath);
		doctags = {
			Title: tags.title,
			Album: tags.album,
			Artist: tags.artist[0],
			PublishedDate: birthtime,
			TrackNumber: tags.track.no,
			FilePath: MusicFilePath,
			Image: tags.picture[0] ? tags.picture[0].data.toString('base64') : '',
			ImageFormat: tags.picture[0] ? tags.picture[0].format : '',
		};
	} else {
		doctags = {
			Title: tags.title,
			Album: tags.album,
			Artist: tags.artist[0],
			PublishedDate: Date.now(),
			TrackNumber: tags.track.no,
			ImagePathDeezer: tags.picture[0],
			DeezerId,
		};
	}//! Need refactor here

	const guessedPath = `${doctags.Artist}.jpg`;

	const newMusic = new MusicModel(doctags);
	const newArtist = new ArtistModel({
		Name: doctags.Artist,
		ImagePath: ArtistImage || guessedPath,
	});
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

const getTags = (filePath) => new Promise((resolve, reject) => {
	mm(fs.createReadStream(filePath), (err, meta) => {
		if (err) reject(err);
		resolve(meta);
	});
});

const Indexation = async () => {
	console.log('[Music Indexer] Starting indexing');
	console.time('[Music Indexer] Time ');

	const files = fs.readdirSync(MusicsFolder);
	/* eslint no-restricted-syntax: "off" */
	for (const file of files) {
		const MusicFilePath = path.join(MusicsFolder, path.basename(file));

		const count = await MusicModel.countDocuments({ FilePath: MusicFilePath });

		if (count === 0 && path.extname(MusicFilePath) === '.mp3') {
			console.log(`[Music Indexer] Adding ${MusicFilePath}`);
			const tags = await getTags(MusicFilePath);
			// console.log(tags);
			if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
				await HandleNewMusic(tags, MusicFilePath);
			}
		}
	}
	console.log(`[Music Indexer] Done - ${files.length} musics`);
	console.timeEnd('[Music Indexer] Time ');
};


module.exports = {
	MusicsFolder,
	ArtistsImageFolder,
	getTags,
	HandleNewMusic,
	AddMusicFromDeezer,
	ReadAllMusics: () => new Promise(() => {
		Indexation();
	}),
};
