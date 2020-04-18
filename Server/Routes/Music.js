const express = require('express');
const path = require('path');

const MusicModel = require('../Database/Models').Music;
const AlbumModel = require('../Database/Models').Album;
const ArtistModel = require('../Database/Models').Artist;

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', (req, res) => {
	MusicModel.search(
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
	MusicModel.findById(req.params.id, (err, doc) => {
		const MusicDoc = doc;
		if (err) console.error(err);
		if (MusicDoc) MusicDoc.FilePath = path.basename(MusicDoc.FilePath);
		res.send(MusicDoc);
	});
});

app.get('/Album/id/:id', (req, res) => {
	AlbumModel.findById(req.params.id)
		.lean()
		.exec((err, doc) => {
			const AlbumDoc = doc;
			if (err) console.error(err);
			MusicModel.findById(AlbumDoc.MusicsId[0], (musicerr, musicdoc) => {
				AlbumDoc.Image = musicdoc.Image;
				res.send(doc);
			});
			// doc.FilePath = path.basename(doc.FilePath);
		});
});

app.get('/Artist/id/:id', (req, res) => {
	ArtistModel.findById(req.params.id, (err, doc) => {
		const ArtistDoc = doc;
		if (err) console.error(err);
		ArtistDoc.ImagePath = path.basename(ArtistDoc.ImagePath);
		res.send(ArtistDoc);
	});
});
