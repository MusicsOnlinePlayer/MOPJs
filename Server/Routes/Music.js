const express = require('express');
const path = require('path');
const MopConsole = require('../Tools/MopConsole');
const MusicModel = require('../Database/Models').Music;
const AlbumModel = require('../Database/Models').Album;
const ArtistModel = require('../Database/Models').Artist;
const { User } = require('../Database/Models');
const {
	AddSearchToDb, AddMusicOfAlbumToDb, AddAlbumOfArtistToDb, AddCoverOfAlbumToDb,
	AddImageOfArtistToDb,
} = require('../Deezer');
const { Downloader } = require('../Deezer/Downloader');
const {
	SearchMusic,
	SearchAlbum,
	SearchArtist,
} = require('../Search/Music');

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', (req, res) => {
	AddSearchToDb(req.params.name)
		.then(() => {
			SearchMusic(req.params.name)
				.then((searchResult) => {
					res.send(searchResult);
				})
				.catch(() => res.send({}));
		});
});

app.get('/Search/Album/Name/:name', (req, res) => {
	SearchAlbum(req.params.name)
		.then((searchResult) => {
			res.send(searchResult);
		})
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', (req, res) => {
	SearchArtist(req.params.name)
		.then((searchResult) => {
			res.send(searchResult);
		})
		.catch(() => res.send({}));
});

app.get('/Music/id/:id', (req, res) => {
	MusicModel.findById(req.params.id, async (err, doc) => {
		if (err) {
			MopConsole.error('Music', err);
			res.send({});
			return;
		}

		if (!doc) {
			MopConsole.warn('Music', `Music id not found ${req.params.id}`);
			res.send({});
			return;
		}

		const MusicDoc = doc.toObject();

		if (MusicDoc) {
			MusicDoc.FilePath = MusicDoc.FilePath
				? path.basename(MusicDoc.FilePath) : undefined;

			const AlbumOfMusic = await AlbumModel.findOne({ Name: MusicDoc.Album });
			MusicDoc.Image = AlbumOfMusic.Image;
			MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
			MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
		}
		res.send(MusicDoc);
	});
});

app.get('/Music/get/:id', (req, res) => {
	MusicModel.findById(req.params.id, async (err, doc) => {
		if (err) {
			MopConsole.error('Music', err);
			res.send({});
			return;
		}

		if (!doc) {
			MopConsole.warn('Music', `Music id not found ${req.params.id}`);
			res.send({});
			return;
		}

		const MusicDoc = doc;
		MusicDoc.Views += 1;
		MusicDoc.LastView = Date.now();
		MusicDoc.save();
		if (req.user) {
			User.findById(req.user._id, (Usererr, Userdoc) => {
				if (Usererr) {
					MopConsole.error('Music - User - History', Usererr);
					return;
				}
				Userdoc.ViewedMusics.push(MusicDoc._id);
				Userdoc.save();
				MopConsole.info('Musics', 'Saved to user history');
			});
		}

		if (err) {
			MopConsole.error('Music', err);
			return;
		}
		if (!MusicDoc) {
			res.send({ FilePath: '' });
			return;
		}

		if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
			res.send({ FilePath: MusicDoc.FilePath ? path.basename(MusicDoc.FilePath) : '' });
			return;
		}

		// TODO Check if it a valid deezer id
		res.send({ FilePath: await Downloader.AddToQueueAsync(MusicDoc.DeezerId) });
	});
});

app.get('/Album/id/:id', (req, res) => {
	AlbumModel.findById(req.params.id)
		.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } }, select: 'TrackNumber _id' })
		.exec(async (err, doc) => {
			if (err) {
				MopConsole.error('Music', err);
				res.send({});
				return;
			}

			if (!doc) {
				MopConsole.warn('Music', `Album id not found ${req.params.id}`);
				res.send({});
				return;
			}

			let AlbumDoc = doc.toObject();

			AlbumDoc.MusicsId = AlbumDoc.MusicsId.map((obj) => obj._id);

			if (AlbumDoc.DeezerId) {
				if (!AlbumDoc.IsComplete && req.query.mode === 'all') {
					await AddMusicOfAlbumToDb(AlbumDoc.DeezerId,
						AlbumDoc.Name,
						AlbumDoc.ImagePathDeezer || await AddCoverOfAlbumToDb(AlbumDoc.DeezerId));
					AlbumDoc = await AlbumModel.findById(req.params.id).lean();
				}
			}

			res.send(AlbumDoc);
			// doc.FilePath = path.basename(doc.FilePath);
		});
});

app.get('/Artist/id/:id', (req, res) => {
	ArtistModel.findById(req.params.id, async (err, doc) => {
		let ArtistDoc = doc;
		if (err) {
			MopConsole.error('Music', err);
			res.send({});
			return;
		}

		if (!ArtistDoc) {
			MopConsole.warn('Music', `Artist id not found ${req.params.id}`);
			res.send({});
			return;
		}

		if (ArtistDoc.DeezerId) {
			if (!ArtistDoc.ImagePath) {
				ArtistDoc.ImagePath = await AddImageOfArtistToDb(ArtistDoc.DeezerId);
			}
			if (req.query.mode === 'all') {
				await AddAlbumOfArtistToDb(ArtistDoc.DeezerId);
				ArtistDoc = await ArtistModel.findById(req.params.id);
			}
		}

		res.send(ArtistDoc);
	});
});
