import express from 'express';
import {} from '../Helper/LikedMusics';

//const LogLocation = 'Services.UserManager.Plugin.Data';

const router = express.Router();

router.get('/Me', (req, res) => {
	if (req.user) {
		res.send({ Account: req.user });
	} else {
		res.sendStatus(200);
	}
});

export default router;
