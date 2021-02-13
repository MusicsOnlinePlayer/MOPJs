import express from 'express';
const router = express.Router();

const LogLocation = 'Services.Frontend.Music.Artist';

router.get('/test', (req, res) => {
	res.send('ok');
});

export default router;
