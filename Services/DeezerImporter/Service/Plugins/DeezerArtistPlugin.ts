import { GetDeezerArtistAlbums, SearchDeezerArtists } from '../DeezerApi/Artist';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Import', (req, res) => {
	const msg = req.body;
	SearchDeezerArtists(msg.query)
		.then((Artists) => {
			axios
				.post('http://deeezerindexer-service:3000/Artist/Index', {
					Artists,
				})
				.then((result) => res.send(result.data))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

router.post('/Albums/Import', (req, res) => {
	const msg = req.body;
	GetDeezerArtistAlbums(msg.DeezerId)
		.then((Albums) => {
			axios
				.post('http://deeezerindexer-service:3000/Artist/Albums/Index', {
					Albums,
					id: msg.DeezerId,
				})
				.then((result) => res.send(result.data))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
