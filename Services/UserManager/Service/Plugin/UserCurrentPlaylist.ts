import express from 'express';
import {
	SetCurrentPlaylistOfUser,
	SetCurrentPlaylistPlayingOfUser,
	GetCurrentPlaylistOfUser,
} from '../Helper/CurrentPlaylist';

const router = express.Router();

router.post('/Musics', (req, res) => {
	//@ts-expect-error weird
	SetCurrentPlaylistOfUser(req.user._id, req.body.CurrentPlaylist)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});

router.post('/Playing', (req, res) => {
	//@ts-expect-error weird
	SetCurrentPlaylistPlayingOfUser(req.user._id, req.body.CurrentPlaylistPlaying)
		.then(() => res.sendStatus(200))
		.catch(() => res.sendStatus(300));
});

router.get('/', (req, res) => {
	//@ts-expect-error weird
	GetCurrentPlaylistOfUser(req.user._id)
		.then((CurrentPlaylist) => res.send(CurrentPlaylist))
		.catch(() => res.sendStatus(300));
});

export default router;
