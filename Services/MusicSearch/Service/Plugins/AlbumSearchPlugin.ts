import { DBAlbumSearch } from '../Search/Album';

import express from 'express';
import axios from 'axios';

const router = express.Router();

router.post('/Search', (req, res) => {
	const msg = req.body;
	axios
		.post(`tcp://deezerimporter-service:3000/Album/Import`, {
			query: msg.query,
		})
		.then(() => {
			DBAlbumSearch(msg.query, msg.page, msg.perPage)
				.then((Albums) => res.send(Albums))
				.catch((err) => res.status(300).send(err));
		})
		.catch((err) => res.status(300).send(err));
});

export default router;
