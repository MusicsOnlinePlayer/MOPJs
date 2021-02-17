import { DBMusicSearch } from '../Search/Music';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Search', (req, res) => {
	const msg = req.body;
	axios
		.post(`tcp://deezerimporter-service:3000/Music/Import`, {
			query: msg.query,
		})
		.then(() => {
			DBMusicSearch(msg.query, msg.page, msg.perPage)
				.then((Musics) => res.send(Musics))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
