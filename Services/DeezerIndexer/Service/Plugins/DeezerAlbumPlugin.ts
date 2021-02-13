import { IndexAlbumMusics, SetDeezerCoverOfAlbum } from '../Indexer/Album';

import express from 'express';

const router = express.Router();

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
