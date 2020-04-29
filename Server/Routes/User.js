const express = require('express');
const passport = require('passport');
const { User } = require('../Database/Models');
const MopConsole = require('../Tools/MopConsole');

module.exports = express();
const app = module.exports;

app.post('/Login', passport.authenticate('local'), (req, res) => {
	res.send({ success: true });
	MopConsole.info('User', 'User logged in');
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
		MopConsole.info('User', `Added user ${req.body.name}`);
	} catch (err) {
		MopConsole.warn('User', "Couldn't register user");
		MopConsole.warn('User', err);
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
	MopConsole.info('User', 'User logged out');
});
