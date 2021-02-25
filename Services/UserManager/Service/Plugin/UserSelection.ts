import express from 'express';
import { GetSelectionForUser } from '../Helper/Selection';

const router = express.Router();

router.get('/', (req, res) => {
	//@ts-expect-error weird
	GetSelectionForUser(req.user, 20)
		.then((musics) => res.send(musics))
		.catch(() => res.sendStatus(300));
});

export default router;
