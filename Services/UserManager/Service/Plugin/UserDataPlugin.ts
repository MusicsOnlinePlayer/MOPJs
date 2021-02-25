import express from 'express';
import { ObjectId } from 'mongodb';
import { GetLikedMusics, LikeMusic } from '../Helper/LikedMusics';
import { GetViewedMusicsOfUser } from '../Helper/HistoryMusics';

//const LogLocation = 'Services.UserManager.Plugin.Data';

const router = express.Router();

router.get('/Me', (req, res) => {
	if (req.user) {
		res.send({ Account: req.user });
	} else {
		res.sendStatus(200);
	}
});

router.get('/Like/:id', async (req, res) => {
	if (req.user) {
		// @ts-expect-error weird things here
		await LikeMusic(new ObjectId(req.params.id), new ObjectId(req.user._id));
		res.send(200);
	}
});

router.get('/LikedMusics', async (req, res) => {
	if (req.user) {
		// @ts-expect-error weird things here
		res.send(await GetLikedMusics(new ObjectId(req.user._id), req.query.Page, req.query.PerPage));
	}
});

router.get('/ViewedMusics', async (req, res) => {
	if (req.user) {
		// @ts-expect-error weird things here
		res.send(await GetViewedMusicsOfUser(new ObjectId(req.user._id), req.query.Page, req.query.PerPage));
	}
});

export default router;
