import { IndexDeezerMusics } from '../Indexer/Music';
import express from 'express';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.DeezerIndexer.Plugins.Music';
const router = express.Router();

router.post('/Index', (req, res) => {
	IndexDeezerMusics(req.body.Musics)
		.then((ids) => res.send({ AddedMusicIds: ids }))
		.catch((err) => {
			MopConsole.error(LogLocation, err);
			MopConsole.error(LogLocation, err.stack);
			res.status(300).send(err);
		});
});

export default router;
