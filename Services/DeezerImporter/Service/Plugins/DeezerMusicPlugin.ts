import { SearchDeezerMusics } from '../DeezerApi/Music';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Import', (req, res) => {
	const msg = req.body;
	SearchDeezerMusics(msg.query)
		.then((Musics) => {
			axios
				.post('http://deeezerindexer-service:3000/Music/Index', {
					Musics,
				})
				.then((result) => res.send(result.data))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
