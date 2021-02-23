import express from 'express';
import axios from 'axios';
import MopConsole from 'lib/MopConsole';
const router = express.Router();

const LogLocation = 'Services.Frontend.Music.Music';

router.get('/test', (req, res) => {
	res.send('ok');
});

router.get('/Search', (req, res) => {
	const { q, Page, PerPage } = req.query;
	axios
		.post('tcp://musicsearch-service:3000/Music/Search', {
			query: q,
			page: parseInt(Page as string),
			perPage: parseInt(PerPage as string),
		})
		.then((r) => res.send(r.data))
		.catch((err) => {
			MopConsole.error(LogLocation, err);
			res.sendStatus(300);
		});
});

export default router;
