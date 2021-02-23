import express from 'express';
import MopConsole from 'lib/MopConsole';
import { IndexArtists, IndexArtistAlbums } from '../Indexer/Artist';

const LogLocation = 'Services.DeezerIndexer.Plugins.Artist';
const router = express.Router();

router.post('/Index', (req, res) => {
	const msg = req.body;
	IndexArtists(msg.Artists)
		.then((ids) => res.send({ AddedArtistIds: ids }))
		.catch((err) => {
			MopConsole.error(LogLocation, err);
			MopConsole.error(LogLocation, err.stack);
			res.status(300).send(err);
		});
});

router.post('/Albums/Index', (req, res) => {
	IndexArtistAlbums(req.body.id, req.body.Albums)
		.then((a) => {
			res.send(a);
		})
		.catch((err) => {
			MopConsole.error(LogLocation, err);
			MopConsole.error(LogLocation, err.stack);
			res.status(300).send(err);
		});
});

export default router;
