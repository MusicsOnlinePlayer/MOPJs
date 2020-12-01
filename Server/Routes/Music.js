const express = require('express');
const sendSeekable = require('send-seekable');
const {
	EnsureAuth,
} = require('../Auth/EnsureAuthentification');

const {
	SearchMusics, SearchAlbums, SearchArtists, SearchPlaylists,
} = require('../Musics/Proxy/Search Proxy');
const {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	HandlePlaylistRequestById,
	AddMusicsToPlaylist,
	RemoveMusicOfPlaylist,
	GetMusicFilePath,
	GetMusicStream,
	IncrementLikeCount,
	SearchAndAddMusicsDeezer,
	ConstructPlaylistFromDz,
	CreatePlaylist,
	RemovePlaylistById,
} = require('../Musics/Handler');
const { MusicsFolder } = require('../Musics/Config');
const { LikeMusicOnUserReq } = require('../Users/Handler');
const MopConsole = require('../Tools/MopConsole');

module.exports = express();
const app = module.exports;


app.get('/Search/Music/Name/:name', EnsureAuth, async (req, res) => {
	await SearchAndAddMusicsDeezer(req.params.name);
	SearchMusics(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Album/Name/:name', EnsureAuth, (req, res) => {
	SearchAlbums(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', EnsureAuth, (req, res) => {
	SearchArtists(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Playlist/Name/:name', EnsureAuth, (req, res) => {
	SearchPlaylists(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
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

app.get('/cdn/:id', sendSeekable, (req, res) => {
	GetMusicFilePath(req.params.id, req.user, true)
		.then(async (result) => {
			if (result.FilePath) {
				res.sendFile(result.FilePath, { root: MusicsFolder });
			} else {
				const { TotalLength, StreamingCache } = await GetMusicStream(result.DeezerId);

				res.sendSeekable(StreamingCache, {
					type: 'audio/mpeg',
					length: TotalLength,
				});
			}
		})
		.catch((err) => res.send(err));
});


app.get('/Music/Like/:id', EnsureAuth, (req, res) => {
	LikeMusicOnUserReq(req.user, req.params.id)
		.then((IsNowLiked) => {
			IncrementLikeCount(req.params.id, IsNowLiked ? 1 : -1);
			res.sendStatus(200);
		})
		.catch(() => res.sendStatus(300));
});

app.get('/Playlist/id/:id', EnsureAuth, (req, res) => {
	HandlePlaylistRequestById(req.params.id)
		.then((doc) => {
			const IsCreator = doc.Creator._id.toString() === req.user._id.toString();
			if (doc.IsPublic || IsCreator) {
				res.send({ ...doc, HasControl: IsCreator });
			}
			res.sendStatus(401);
		})
		.catch(() => res.sendStatus(300));
});

app.delete('/Playlist/id/:id', EnsureAuth, (req, res) => {
	HandlePlaylistRequestById(req.params.id)
		.then((doc) => {
			if (doc.Creator._id.toString() === req.user._id.toString()) {
				RemovePlaylistById(doc._id)
					.then(() => res.sendStatus(200))
					.catch(() => res.sendStatus(300));
				return;
			}
			res.sendStatus(401);
		})
		.catch(() => res.sendStatus(300));
});

app.post('/Playlist/Create/Deezer', EnsureAuth, (req, res) => {
	if (req.body.Name && req.body.DeezerId && req.body.IsPublic !== undefined) {
		ConstructPlaylistFromDz(req.body.DeezerId, req.body.Name, req.user._id, req.body.IsPublic)
			.then((pId) => res.send({ CreatedPlaylistId: pId }))
			.catch(() => res.sendStatus(300));
	} else {
		res.sendStatus(422);
	}
});

app.post('/Playlist/Create/', EnsureAuth, (req, res) => {
	if (req.body.Name && req.body.MusicsId && req.body.IsPublic !== undefined) {
		CreatePlaylist(req.body.Name, req.body.MusicsId, req.user._id, req.body.IsPublic)
			.then((pId) => res.send({ CreatedPlaylistId: pId }))
			.catch(() => res.sendStatus(300));
	} else {
		res.sendStatus(422);
	}
});

app.post('/Playlist/id/:id/Add/', EnsureAuth, (req, res) => {
	if (Array.isArray(req.body.MusicsId)) {
		HandlePlaylistRequestById(req.params.id)
			.then(async (doc) => {
				const IsCreator = doc.Creator._id.toString() === req.user._id.toString();
				if (IsCreator) {
					AddMusicsToPlaylist(doc._id, req.body.MusicsId)
						.then(() => res.sendStatus(200))
						.catch(() => res.sendStatus(300));
				} else {
					res.sendStatus(401);
				}
			})
			.catch((err) => {
				MopConsole.warn('Routes.Music', err);
				res.sendStatus(300);
			});
	} else {
		res.sendStatus(422);
	}
});

// TODO Delete music by playlist index rather than by id
app.delete('/Playlist/id/:id/Remove/', EnsureAuth, (req, res) => {
	if (req.body.MusicId) {
		HandlePlaylistRequestById(req.params.id)
			.then(async (doc) => {
				const IsCreator = doc.Creator._id.toString() === req.user._id.toString();
				if (IsCreator) {
					RemoveMusicOfPlaylist(doc._id, req.body.MusicId)
						.then(() => res.sendStatus(200))
						.catch(() => res.sendStatus(300));
				} else {
					res.sendStatus(401);
				}
			})
			.catch((err) => {
				MopConsole.warn('Routes.Music', err);
				res.sendStatus(300);
			});
	} else {
		res.sendStatus(422);
	}
});
