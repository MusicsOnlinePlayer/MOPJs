const express = require('express');

const {
	EnsureAuth,
} = require('../Auth/EnsureAuthentification');

const { EsMusicSearch, EsAlbumSearch, EsArtistSearch } = require('../Musics/Proxy/ES Proxy');
const {
	HandleMusicRequestById, HandleAlbumRequestById, HandleArtistRequestById, GetMusicFilePath,
} = require('../Musics/Handler');
const { MusicsFolder } = require('../Musics/Config');
const { LikeMusicOnUserReq } = require('../Users/Handler');

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', EnsureAuth, (req, res) => {
	EsMusicSearch(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Album/Name/:name', EnsureAuth, (req, res) => {
	EsAlbumSearch(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', EnsureAuth, (req, res) => {
	EsArtistSearch(req.params.name)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});


app.get('/Music/id/:id', EnsureAuth, (req, res) => {
	HandleMusicRequestById(req.params.id, req.user)
		.then((Music) => res.send(Music))
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


app.get('/Music/get/:id', EnsureAuth, (req, res) => {
	GetMusicFilePath(req.params.id, req.user, !(req.query.noLog === 'true'))
		.then((FilePath) => res.send(FilePath))
		.catch(() => res.send({}));
});

app.get('/cdn/:id', (req, res) => {
	GetMusicFilePath(req.params.id, req.user, true)
		.then(({ FilePath }) => {
			res.sendFile(FilePath, { root: MusicsFolder }, () => {});
		})
		.catch((err) => res.send(err));
});


app.get('/Music/Like/:id', EnsureAuth, (req, res) => {
	LikeMusicOnUserReq(req.user, req.params.id)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});
