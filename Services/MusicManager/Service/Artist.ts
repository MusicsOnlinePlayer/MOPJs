import axios from 'axios';
import express from 'express';
import { Artist } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';

const router = express.Router();

const LogLocation = 'Services.MusicManager.Artist';

router.post('/Get', (req, res) => {
	Artist.findById(req.body.id)
		.populate({
			path: 'AlbumsId',
			populate: {
				path: 'MusicsId',
				model: 'Music',
			},
		})
		.exec(async (err, doc) => {
			const ArtistDoc = doc;
			if (err) {
				MopConsole.error(LogLocation, err.message);
				res.sendStatus(300);
				return;
			}
			if (!ArtistDoc) {
				MopConsole.warn(LogLocation, `Artist id not found ${req.body.id}`);
				res.sendStatus(404);
				return;
			}

			if (ArtistDoc.DeezerId) {
				await axios
					.post('tcp://deezerimporter-service:3000/Artist/Albums/Import', {
						DeezerId: doc.DeezerId,
					})
					.then((r) => {
						res.send(r.data);
					});

				return;
			}
		});
});

export default router;
