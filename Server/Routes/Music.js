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

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', (req, res) => {
	AddSearchToDb(req.params.name)
		.then(() => {
			MusicModel.search(
				{
					multi_match: {
						query: req.params.name,
						fields: ['Title', 'Artist^2', 'Album^0.5'],
					},
				},
				{
					size: 8,
				},
				(err, result) => {
					if (err) {
						MopConsole.error('Music - Search', err);
						return;
					}
					const ClientResults = [];

					if (!result) {
						MopConsole.error('Music - Search', 'Request error !');
						res.send({});
						return;
					}


					result.hits.hits.map((hit) => {
						ClientResults.push(hit._id);
					});
					res.send(ClientResults);
				},
			);
		});
});

app.get('/Search/Album/Name/:name', (req, res) => {
	AlbumModel.search(
		{
			multi_match: {
				query: req.params.name,
				fields: ['Name'],
			},
		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				MopConsole.error('Music - Search', err);
			}
			const ClientResults = [];

			if (!result) {
				MopConsole.error('Music - Search', 'Request error !');
				res.send({});
				return;
			}

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		},
	);
});

app.get('/Search/Artist/Name/:name', (req, res) => {
	ArtistModel.search(
		{
			multi_match: {
				query: req.params.name,
				fields: ['Name'],
			},
		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				MopConsole.error('Music - Search', err);
			}
			const ClientResults = [];

			if (!result) {
				MopConsole.error('Music - Search', 'Request error !');
				res.send({});
				return;
			}

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		},
	);
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
