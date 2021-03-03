import express from 'express';
import MinioClient from '../Minio/Client';
import StreamQueue from '../Helper/StreamQueue';
import sendSeekable from 'send-seekable';
import { Music } from 'lib/Models/Musics';

const router = express.Router();

router.get('/Music/:id', sendSeekable, async (req, res) => {
	const { id } = req.params;
	const DeezerId = parseInt(id);
	try {
		const objectStats = await MinioClient.statObject('mopmusics', `${(await Music.findOne({ DeezerId }))._id}.mp3`);
		console.log(objectStats);
		const stream = await MinioClient.getObject('mopmusics', `${(await Music.findOne({ DeezerId }))._id}.mp3`);
		//@ts-expect-error not implemented
		res.sendSeekable(stream, {
			type: 'audio/mpeg',
			length: objectStats.size,
		});
	} catch (e) {
		StreamQueue.AddToQueueAsync(DeezerId)
			.then((download) => {
				console.log('Sending stream');
				//@ts-expect-error not implemented
				res.sendSeekable(download.StreamingCache, {
					type: 'audio/mpeg',
					length: download.TotalLength,
				});
			})
			.catch(() => res.sendStatus(300));
	}
});

export default router;
