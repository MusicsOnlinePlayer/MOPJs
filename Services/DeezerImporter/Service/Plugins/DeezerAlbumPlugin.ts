import { SearchDeezerAlbums } from '../DeezerApi/Album';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Import', (req, res) => {
	const msg = req.body;
	SearchDeezerAlbums(msg.query)
		.then((Albums) => {
			axios
				.post('http://deeezerindexer-service:3000/Album/Index', {
					Albums,
				})
				.then((result) => res.send(result.data))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
