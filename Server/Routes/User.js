const express = require('express');
const passport = require('passport');
const { User } = require('../Database/Models');

module.exports = express();
const app = module.exports;

app.post('/Login', passport.authenticate('local'), (req, res) => {
	res.send({ success: true });
	console.log('[User] User logged in');
});
app.post('/Register', async (req, res) => {
	if (!req.body.name) { res.send({ success: false }); }
	if (!req.body.password) { res.send({ success: false }); }

	try {
		const user = new User({
			username: req.body.name,
		});
		await user.setPassword(req.body.password);
		await user.save();
		res.send({ success: true });
		console.log(`[User] Added user ${req.body.name}`);
	} catch (err) {
		console.log("[User] Couldn't register user");
		console.log(err);
		res.send({ success: false });
	}
	// const { user } = await User.authenticate()(req.body.username, req.body.password);
});


app.get('/Me', (req, res) => {
	if (req.user) {
		res.send({
			Account: req.user,
		});
	} else {
		res.sendStatus(200);
	}
});

app.get('/Logout', (req, res) => {
	req.logout();
	res.sendStatus(200);
});
