import axios from 'axios';
import express from 'express';
import { Album } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';

const router = express.Router();

const LogLocation = 'Services.MusicManager.Album';

router.post('/Get', (req, res) => {
	Album.findById(req.body.id)
		.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
		.exec(async (err, ReceivedAlbum) => {
			if (err) {
				MopConsole.error(LogLocation, err.message);
				res.sendStatus(300);
				return;
			}
			if (ReceivedAlbum.DeezerId) {
				if (!ReceivedAlbum.IsComplete) {
					await axios
						.post('tcp://deezerimporter-service:3000/Album/Musics/Import', {
							DeezerId: ReceivedAlbum.DeezerId,
						})
						.then((r) => {
							res.send(r.data);
						});

					return;
				}
			}
			res.send(ReceivedAlbum);
		});
});

export default router;
