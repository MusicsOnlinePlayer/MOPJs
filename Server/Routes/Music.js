const app = (module.exports = require('express')());
var MusicModel = require('./../Database/Models').Music;
var AlbumModel = require('./../Database/Models').Album;
var ArtistModel = require('./../Database/Models').Artist;
var path = require('path');

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
		function (err, result) {
			if (err) {
				console.error(err);
			}
			ClientResults = [];

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		}
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
		function (err, result) {
			if (err) {
				console.error(err);
			}
			ClientResults = [];

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		}
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
		function (err, result) {
			if (err) {
				console.error(err);
			}
			ClientResults = [];

			result.hits.hits.map((hit) => {
				ClientResults.push(hit._id);
			});
			res.send(ClientResults);
		}
	);
});

app.get('/Music/id/:id', (req, res) => {
	MusicModel.findById(req.params.id, (err, doc) => {
		if (err) console.error(err);
		doc.FilePath = path.basename(doc.FilePath);
		res.send(doc);
	});
});

app.get('/Album/id/:id', (req, res) => {
	AlbumModel.findById(req.params.id, (err, doc) => {
		if (err) console.error(err);
		//doc.FilePath = path.basename(doc.FilePath);
		res.send(doc);
	});
});

app.get('/Artist/id/:id', (req, res) => {
	ArtistModel.findById(req.params.id, (err, doc) => {
		if (err) console.error(err);
		doc.ImagePath = path.basename(doc.ImagePath);
		res.send(doc);
	});
});
