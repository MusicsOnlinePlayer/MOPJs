import express from 'express';
import MopConsole from 'lib/MopConsole';
import passport from 'passport';
import { RegisterUser } from '../Helper/Authentication';

const LogLocation = 'Services.UserManager.Plugin.Authentication';

const router = express.Router();

router.post('/Login', passport.authenticate('local'), (req, res) => {
	res.send({ success: true });
	MopConsole.info(LogLocation, 'User logged in');
});

router.post('/Register', async (req, res) => {
	if (!req.body.name) {
		res.send({ success: false });
	}
	if (!req.body.password) {
		res.send({ success: false });
	}

	RegisterUser(req.body.name, req.body.password)
		.then((newUser) => {
			req.logIn(newUser, (err) => {
				if (err) {
					MopConsole.error(LogLocation, err.message);
					res.send({ success: false });
				}
				res.send({ success: true });
			});
		})
		.catch(() => res.send({ success: false }));
	// const { user } = await User.authenticate()(req.body.username, req.body.password);
});

router.get('/Logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
	MopConsole.info(LogLocation, 'User logged out');
});

export default router;
