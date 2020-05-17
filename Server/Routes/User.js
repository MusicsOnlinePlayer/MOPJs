const express = require('express');
const passport = require('passport');
const MopConsole = require('../Tools/MopConsole');
const { RegisterUser, GetLikedMusicsOfUser, GetViewedMusicsOfUser } = require('../Action/User');
const { EnsureAuth } = require('../Auth/EnsureAuthentification');

module.exports = express();
const app = module.exports;

app.post('/Login', passport.authenticate('local'), (req, res) => {
	res.send({ success: true });
	MopConsole.info('User', 'User logged in');
});
app.post('/Register', async (req, res) => {
	if (!req.body.name) { res.send({ success: false }); }
	if (!req.body.password) { res.send({ success: false }); }

	RegisterUser(req.body.name, req.body.password)
		.then((newUser) => {
			req.logIn(newUser, (err) => {
				if (err) {
					MopConsole.error('User', err);
					res.send({ success: false });
				}
				res.send({ success: true });
			});
		})
		.catch(() => res.send({ success: false }));
	// const { user } = await User.authenticate()(req.body.username, req.body.password);
});


app.get('/Me', (req, res) => {
	req.user ? res.send({ Account: req.user }) : res.sendStatus(200);
});

app.get('/LikedMusics', EnsureAuth, (req, res) => {
	GetLikedMusicsOfUser(req.user)
		.then((musics) => res.send({ MusicsId: musics }));
});

app.get('/ViewedMusics', EnsureAuth, (req, res) => {
	GetViewedMusicsOfUser(req.user)
		.then((musics) => res.send({ MusicsId: musics }));
});


app.get('/Logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
	MopConsole.info('User', 'User logged out');
});
