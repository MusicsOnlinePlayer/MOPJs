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
	HandleLikeMusic,
} = require('../Action/Music');

const {
	EnsureAuth,
} = require('../Auth/EnsureAuthentification');

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', EnsureAuth, (req, res) => {
	AddSearchToDb(req.params.name)
		.then(() => {
			SearchMusic(req.params.name)
				.then((searchResult) => res.send(searchResult))
				.catch(() => res.send({}));
		})
		.catch(() => res.send({}));
});

app.get('/Search/Album/Name/:name', EnsureAuth, (req, res) => {
	SearchAlbum(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', EnsureAuth, (req, res) => {
	SearchArtist(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Music/id/:id', EnsureAuth, (req, res) => {
	HandleMusicRequestById(req.params.id, req.user)
		.then((Music) => res.send(Music))
		.catch(() => res.send({}));
});

app.get('/Music/Like/:id', EnsureAuth, (req, res) => {
	HandleLikeMusic(req.user, req.params.id)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});

app.get('/Music/get/:id', EnsureAuth, (req, res) => {
	GetMusicFilePath(req.params.id, req.user, !(req.query.noLog === 'true'))
		.then((FilePath) => res.send(FilePath))
		.catch(() => res.send({}));
});

app.get('/Album/id/:id', EnsureAuth, (req, res) => {
	HandleAlbumRequestById(req.params.id, req.query.mode)
		.then((Album) => res.send(Album))
		.catch(() => res.send({}));
});

app.get('/Artist/id/:id', EnsureAuth, (req, res) => {
	HandleArtistRequestById(req.params.id, req.query.mode)
		.then((Artist) => res.send(Artist))
		.catch(() => res.send({}));
});
