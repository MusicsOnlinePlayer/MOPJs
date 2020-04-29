const express = require('express');
const path = require('path');
const fs = require('fs');
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
					query_string: {
						analyze_wildcard: true,
						query: req.params.name,
					},
				},
				{
					size: 8,
				},
				(err, result) => {
					if (err) {
						console.error(err);
					}
					const ClientResults = [];

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
			query_string: {
				query: req.params.name,
			},
		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				console.error(err);
			}
			const ClientResults = [];

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
			query_string: {
				query: req.params.name,
			},
		},
		{
			size: 8,
		},
		(err, result) => {
			if (err) {
				console.error(err);
			}
			const ClientResults = [];

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		},
	);
});

app.get('/Music/id/:id', (req, res) => {
	MusicModel.findById(req.params.id, async (err, doc) => {
		const MusicDoc = doc.toObject();
		if (err) console.error(err);
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
		const MusicDoc = doc;
		MusicDoc.Views += 1;
		MusicDoc.LastView = Date.now();
		MusicDoc.save();
		if (req.user) {
			User.findById(req.user._id, (Usererr, Userdoc) => {
				if (Usererr) {
					console.log(Usererr);
					return;
				}
				Userdoc.ViewedMusics.push(MusicDoc._id);
				Userdoc.save();
				console.log('[Musics] Saved to user history');
			});
		}

		if (err) {
			console.error(err);
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
		.lean()
		.exec(async (err, doc) => {
			if (err) console.error(err);
			let AlbumDoc = doc;

			if (AlbumDoc.DeezerId) {
				if (!AlbumDoc.IsComplete) {
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
		if (err) console.error(err);

		if (ArtistDoc.DeezerId) {
			if (!ArtistDoc.ImagePath) {
				ArtistDoc.ImagePath = await AddImageOfArtistToDb(ArtistDoc.DeezerId);
			}
			await AddAlbumOfArtistToDb(ArtistDoc.DeezerId);
			ArtistDoc = await ArtistModel.findById(req.params.id);
		}

		res.send(ArtistDoc);
	});
});
