const fs = require('fs');
const path = require('path');
const MopConsole = require('../../Tools/MopConsole');
const { Music, Album, Artist } = require('../Models');
const { ArtistsImageFolder } = require('./Utils');

const SaveAndIndex = (MyMusicModel) => new Promise((resolve) => {
	MyMusicModel.save((err, savedModel) => {
		if (err) throw err;

		MyMusicModel.on('es-indexed', (erres) => {
			if (erres) throw erres;

			resolve(savedModel);
		});
	});
});

async function AddMusicToDatabase(doctags, ArtistImage = undefined, EnableEsIndexWait = false) {
	let guessedPath = `${doctags.Artist}.jpg`;

	if (!fs.existsSync(path.join(ArtistsImageFolder, guessedPath))) { guessedPath = undefined; }

	const NewTagsForAlbum = {
		Name: doctags.Album,
		DeezerId: doctags.AlbumDzId,
		Image: doctags.Image,
		ImagePathDeezer: doctags.ImagePathDeezer,
		ImageFormat: doctags.ImageFormat,
	};

	const NewTagsForMusicDocs = doctags;

	NewTagsForMusicDocs.Image = undefined;
	NewTagsForMusicDocs.ImagePathDeezer = undefined;
	NewTagsForMusicDocs.ImageFormat = undefined;


	const newMusic = new Music(NewTagsForMusicDocs);
	const newAlbum = new Album(NewTagsForAlbum);
	const newArtist = new Artist({
		Name: doctags.Artist,
		DeezerId: doctags.ArtistDzId,
		ImagePath: ArtistImage || guessedPath,
	});


	const musicDoc = EnableEsIndexWait ? await SaveAndIndex(newMusic) : await newMusic.save();
	const albumDoc = await Album.findOneOrCreate({ Name: newAlbum.Name }, newAlbum);
	const artistDoc = await Artist.findOneOrCreate({ Name: newArtist.Name }, newArtist);


	albumDoc.DeezerId = newAlbum.DeezerId;
	artistDoc.DeezerId = newArtist.DeezerId;

	albumDoc.MusicsId.push(musicDoc._id);
	const savedAlbum = await albumDoc.save();
	if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
		MopConsole.log('Music - Indexer', `Added ${savedAlbum.Name}`);
		artistDoc.AlbumsId.push(savedAlbum);
		await artistDoc.save();
	}
}

const UpdateIfNeededTrackNumber = (tags) => new Promise((resolve) => {
	Music.findOneAndUpdate({ Title: tags.Title }, { TrackNumber: tags.TrackNumber })
		.then(() => {
			// console.log(`[Music Indexer] Update track number of ${tags.Title}`);
			resolve();
		});
});

const AppendMusicToAlbum = async (tags) => {
	const newMusic = new Music(tags);
	const savedMusic = await newMusic.save();
	const albumDoc = await Album.findOne({ Name: tags.Album });
	albumDoc.MusicsId.push(savedMusic._id);
	await albumDoc.save();
	MopConsole.log('Music - Indexer', `Added new music to ${albumDoc.Name}`);
};

async function AppendOrUpdateMusicToAlbum(musicTags) {
	const count = await Music.countDocuments({ Title: musicTags.Title });
	if (count > 0) {
		await UpdateIfNeededTrackNumber(musicTags);
	} else {
		await AppendMusicToAlbum(musicTags);
	}
}

async function AppendAlbumsToArtist(ArtistDzId, Albums) {
	const artistDoc = await (await Artist.findOne({ DeezerId: ArtistDzId })).populate('AlbumsId').execPopulate();
	Albums.forEach(async (AlbumElement) => {
		if (!artistDoc.AlbumsId.some((e) => e.Name === AlbumElement.Name)) {
			const AlbumDoc = new Album({
				Name: AlbumElement.Name,
				DeezerId: AlbumElement.DeezerId,
				ImagePathDeezer: AlbumElement.ImagePathDeezer,
			});
			const newAlbum = await Album.findOneOrCreate({ Name: AlbumDoc.Name }, AlbumDoc);
			artistDoc.AlbumsId.push(newAlbum._id);
		}
	});
}

async function UpdateAlbumCompleteStatus(AlbumDzId) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
}

async function AppendDzCoverToAlbum(AlbumDzId, ImagePathDeezer) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { ImagePathDeezer });
}

async function AppendDzImageToArtist(ArtistDzId, ImagePath) {
	await Artist.findOneAndUpdate({ DeezerId: ArtistDzId }, { ImagePath });
}

module.exports = {
	AddMusicToDatabase,
	AppendOrUpdateMusicToAlbum,
	UpdateAlbumCompleteStatus,
	AppendAlbumsToArtist,
	AppendDzCoverToAlbum,
	AppendDzImageToArtist,
};
