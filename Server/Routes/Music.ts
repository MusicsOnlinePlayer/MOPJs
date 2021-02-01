import express from 'express';
import sendSeekable from 'send-seekable';
import { ObjectId } from 'mongodb';
import { EnsureAuth } from '../Auth/EnsureAuthentication';

import Search from '../Musics/Proxy/Search Proxy';
import {
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
} from '../Musics/Handler';
import { ImportTrendingMusics } from '../Musics/Handler/DeezerHandler';
import { MusicsFolder } from '../Musics/Config';
import { LikeMusicOnUser } from '../Users/Handler';
import MopConsole from '../Tools/MopConsole';
import { isUser } from '../Users/Model/Interfaces';
import { GetSelectionForUser } from '../Musics/Proxy/Selection';

const app = express();
export default app;

app.get('/Selection/v1/', EnsureAuth, (req,res) => {
	GetSelectionForUser(req.user, 20)
		.then((musics) => res.send(musics))
		.catch(() => res.sendStatus(300))
});

app.get('/Music/Trending/', EnsureAuth, (req,res) => {
	ImportTrendingMusics()
		.then((musics) => res.send(musics))
		.catch(() => res.sendStatus(300))
})

app.get('/Search/Music/Name/:name', EnsureAuth, async (req, res) => {
	await SearchAndAddMusicsDeezer(req.params.name);
	Search.SearchMusics(
		req.params.name,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Album/Name/:name', EnsureAuth, (req, res) => {
	Search.SearchAlbums(
		req.params.name,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Artist/Name/:name', EnsureAuth, (req, res) => {
	Search.SearchArtists(
		req.params.name,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Search/Playlist/Name/:name', EnsureAuth, (req, res) => {
	Search.SearchPlaylists(
		req.params.name,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((searchResult) => res.send(searchResult))
		.catch(() => res.send({}));
});

app.get('/Music/id/:id', EnsureAuth, (req, res) => {
	HandleMusicRequestById(new ObjectId(req.params.id), req.user)
		.then((Music) => res.send(Music))
		.catch(() => res.send({}));
});

app.get('/Album/id/:id', EnsureAuth, (req, res) => {
	HandleAlbumRequestById(new ObjectId(req.params.id))
		.then((Album) => res.send(Album))
		.catch(() => res.send({}));
});

app.get('/Artist/id/:id', EnsureAuth, (req, res) => {
	HandleArtistRequestById(new ObjectId(req.params.id))
		.then((Artist) => res.send(Artist))
		.catch(() => res.send({}));
});

app.get('/cdn/:id', sendSeekable, (req, res) => {
	GetMusicFilePath(new ObjectId(req.params.id), req.user, true)
		.then(async (result) => {
			if (result.FilePath) {
				res.sendFile(result.FilePath, { root: MusicsFolder });
			} else {
				const { TotalLength, StreamingCache } = await GetMusicStream(result.DeezerId);
				console.log(TotalLength)
				res.sendSeekable(StreamingCache, {
					type: 'audio/mpeg',
					length: TotalLength,
				});
			}
		})
		.catch((err) => res.send(err));
});

app.get('/Music/Like/:id', EnsureAuth, (req, res) => {
	LikeMusicOnUser(new ObjectId(req.params.id), new ObjectId(req.user._id))
		.then((IsNowLiked) => {
			IncrementLikeCount(new ObjectId(req.params.id), IsNowLiked ? 1 : -1);
			res.sendStatus(200);
		})
		.catch(() => res.sendStatus(300));
});

app.get('/Playlist/id/:id', EnsureAuth, (req, res) => {
	HandlePlaylistRequestById(new ObjectId(req.params.id))
		.then((doc) => {
			const creator = isUser(doc.Creator) ? doc.Creator : undefined;
			const IsCreator = creator._id.toString() === req.user._id.toString();
			if (doc.IsPublic || IsCreator) {
				res.send({ ...doc, HasControl: IsCreator });
			}
			res.sendStatus(401);
		})
		.catch(() => res.sendStatus(300));
});

app.delete('/Playlist/id/:id', EnsureAuth, (req, res) => {
	HandlePlaylistRequestById(new ObjectId(req.params.id))
		.then((doc) => {
			const creator = isUser(doc.Creator) ? doc.Creator : undefined;
			if (creator._id.toString() === req.user._id.toString()) {
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
		HandlePlaylistRequestById(new ObjectId(req.params.id))
			.then(async (doc) => {
				const creator = isUser(doc.Creator) ? doc.Creator : undefined;
				const IsCreator = creator._id.toString() === req.user._id.toString();
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
		HandlePlaylistRequestById(new ObjectId(req.params.id))
			.then(async (doc) => {
				const creator = isUser(doc.Creator) ? doc.Creator : undefined;
				const IsCreator = creator._id.toString() === req.user._id.toString();
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

