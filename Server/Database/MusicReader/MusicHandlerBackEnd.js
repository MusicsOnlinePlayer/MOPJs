const { Music, Album, Artist } = require('../Models');

const SaveAndIndex = (MyMusicModel) => new Promise((resolve) => {
	MyMusicModel.save((err, savedModel) => {
		if (err) throw err;

		MyMusicModel.on('es-indexed', (erres) => {
			if (erres) throw erres;

			resolve(savedModel);
		});
	});
});

async function AddMusicToDatabase(doctags, ArtistImage = undefined) {
	const guessedPath = `${doctags.Artist}.jpg`;
	const newMusic = new Music(doctags);
	const newArtist = new Artist({
		Name: doctags.Artist,
		DeezerId: doctags.ArtistDzId,
		ImagePath: ArtistImage || guessedPath,
	});
	const newAlbum = new Album({ Name: doctags.Album, DeezerId: doctags.AlbumDzId });
	const musicDoc = await SaveAndIndex(newMusic);
	const artistDoc = await Artist.findOneOrCreate({ Name: newArtist.Name }, newArtist);
	const albumDoc = await Album.findOneOrCreate({ Name: newAlbum.Name }, newAlbum);

	albumDoc.DeezerId = newAlbum.DeezerId;
	artistDoc.DeezerId = newArtist.DeezerId;

	albumDoc.MusicsId.push(musicDoc._id);
	const savedAlbum = await albumDoc.save();
	if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
		console.log(`[Music Indexer] Added ${savedAlbum.Name}`);
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
	console.log(`[Music Indexer] Added new music to ${albumDoc.Name}`);
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
		if (!artistDoc.AlbumsId.some((e) => e.DeezerId === AlbumElement.DeezerId)) {
			const AlbumDoc = new Album({ Name: AlbumElement.Name, DeezerId: AlbumElement.DeezerId });
			await AlbumDoc.save();
		}
	});
}

async function UpdateAlbumCompleteStatus(AlbumDzId) {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
}

module.exports = {
	AddMusicToDatabase,
	AppendOrUpdateMusicToAlbum,
	UpdateAlbumCompleteStatus,
	AppendAlbumsToArtist,
};
