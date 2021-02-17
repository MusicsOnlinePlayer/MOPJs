import { IndexAlbumMusics, SetDeezerCoverOfAlbum, IndexAlbums } from '../Indexer/Album';

import express from 'express';
import MopConsole from 'lib/MopConsole';
const LogLocation = 'Services.DeezerIndexer.Plugins.Music';
const router = express.Router();

router.post('/Index', (req, res) => {
	const msg = req.body;
	IndexAlbums(msg.Albums)
		.then((ids) => res.send({ AddedAlbumIds: ids }))
		.catch((err) => {
			MopConsole.error(LogLocation, err);
			MopConsole.error(LogLocation, err.stack);
			res.status(300).send(err);
		});
});

router.post('/Index/Musics', (req, res) => {
	const msg = req.body;
	IndexAlbumMusics(msg.id, msg.Musics)
		.then((Album) => res.send({ Album }))
		.catch((err) => res.status(300).send(err));
});

router.post('/Index/Cover', (req, res) => {
	const msg = req.body;
	SetDeezerCoverOfAlbum(msg.id, msg.path)
		.then((Album) => res.send({ Album }))
		.catch((err) => res.status(300).send(err));
});

export default router;
