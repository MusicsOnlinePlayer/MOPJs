import { DBArtistSearch } from '../Search/Artist';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Search', (req, res) => {
	const msg = req.body;
	axios
		.post(`tcp://deezerimporter-service:3000/Artist/Import`, {
			query: msg.query,
		})
		.then(() => {
			DBArtistSearch(msg.query, msg.page, msg.perPage)
				.then((Artists) => res.send(Artists))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
