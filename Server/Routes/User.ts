import express from 'express';
import passport from 'passport';
import { ObjectId } from 'mongodb';
import MopConsole from '../Tools/MopConsole';
import { EnsureAuth } from '../Auth/EnsureAuthentication';
import {
	RegisterUser,
	GetLikedMusicsOfUser,
	GetViewedMusicsOfUser,
	GetPlaylistsOfUser,
	GetCurrentPlaylistOfUser,
	SetCurrentPlaylistOfUser,
	SetCurrentPlaylistPlayingOfUser,
} from '../Users/Handler';

const app = express();
export default app;

app.post('/Login', passport.authenticate('local'), (req, res) => {
	res.send({ success: true });
	MopConsole.info('Route.User', 'User logged in');
});

app.post('/Register', async (req, res) => {
	if (!req.body.name) {
		res.send({ success: false });
	}
	if (!req.body.password) {
		res.send({ success: false });
	}

	RegisterUser(req.body.name, req.body.password)
		.then((newUser) => {
			req.logIn(newUser, (err) => {
				if (err) {
					MopConsole.error('Route.User', err.message);
					res.send({ success: false });
				}
				res.send({ success: true });
			});
		})
		.catch(() => res.send({ success: false }));
	// const { user } = await User.authenticate()(req.body.username, req.body.password);
});

app.get('/Me', (req, res) => {
	if (req.user) {
		res.send({ Account: req.user });
	} else {
		res.sendStatus(200);
	}
});

app.get('/LikedMusics', EnsureAuth, (req, res) => {
	GetLikedMusicsOfUser(
		req.user._id,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((musics) => res.send(musics));
});

app.get('/ViewedMusics', EnsureAuth, (req, res) => {
	GetViewedMusicsOfUser(
		req.user._id,
		parseInt(req.query.Page as string, 10),
		parseInt(req.query.PerPage as string, 10),
	)
		.then((musics) => res.send(musics));
});

app.get('/:id/Playlists', EnsureAuth, (req, res) => {
	GetPlaylistsOfUser(
		new ObjectId(req.params.id),
		req.user._id.toString() === req.params.id.toString(),
	)
		.then((Playlists) => res.send(Playlists))
		.catch(() => res.sendStatus(300));
});

app.get('/Playlists', EnsureAuth, (req, res) => {
	GetPlaylistsOfUser(req.user._id, true)
		.then((Playlists) => res.send(Playlists))
		.catch(() => res.sendStatus(300));
});

app.get('/CurrentPlaylist', EnsureAuth, (req, res) => {
	GetCurrentPlaylistOfUser(req.user._id)
		.then((CurrentPlaylist) => res.send(CurrentPlaylist))
		.catch(() => res.sendStatus(300));
});

app.post('/CurrentPlaylist/Musics', EnsureAuth, (req, res) => {
	SetCurrentPlaylistOfUser(req.user._id, req.body.CurrentPlaylist)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});

app.post('/CurrentPlaylist/Playing', EnsureAuth, (req, res) => {
	SetCurrentPlaylistPlayingOfUser(req.user._id, req.body.CurrentPlaylistPlaying)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});

app.get('/Logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
	MopConsole.info('Route.User', 'User logged out');
});
