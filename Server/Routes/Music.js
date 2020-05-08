const express = require('express');
const { AddSearchToDb } = require('../Deezer');

const {
	SearchMusic,
	SearchAlbum,
	SearchArtist,
} = require('../Search/Music');
const {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
} = require('../Action/Music');

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', (req, res) => {
	AddSearchToDb(req.params.name)
		.then(() => {
			SearchMusic(req.params.name)
				.then((searchResult) => res.send(searchResult))
				.catch(() => res.send({}));
		});
});

app.get('/Search/Album/Name/:name', (req, res) => {
	SearchAlbum(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', (req, res) => {
	SearchArtist(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Music/id/:id', (req, res) => {
	HandleMusicRequestById(req.params.id)
		.then((Music) => res.send(Music))
		.catch(() => res.send({}));
});

app.get('/Music/get/:id', (req, res) => {
	GetMusicFilePath(req.params.id, req.user)
		.then((FilePath) => res.send(FilePath))
		.catch(() => res.send({}));
});

app.get('/Album/id/:id', (req, res) => {
	HandleAlbumRequestById(req.params.id, req.query.mode)
		.then((Album) => res.send(Album))
		.catch(() => res.send({}));
});

app.get('/Artist/id/:id', (req, res) => {
	HandleArtistRequestById(req.params.id, req.query.mode)
		.then((Artist) => res.send(Artist))
		.catch(() => res.send({}));
});
