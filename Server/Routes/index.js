const express = require('express');
const path = require('path');

module.exports = express();
const app = module.exports;
const { ReadAllMusics } = require('../Database/MusicReader/MusicReader');
const { ConnectToDB } = require('../Database/Db');

ConnectToDB().then(() => {
	// ClearMusics().then(() => {
	ReadAllMusics();
	// });
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../Public/index.html'));
});

const staticPath = path.join(__dirname, '../../Public/');
const musicPath = require('../Database/MusicReader/MusicReader').MusicsFolder;

app.use(express.static(staticPath));
app.use(express.static(musicPath));

app.use((req, res, next) => {
	console.log();
	console.log(`[Path - Log] ${req.url}`);
	next();
});

app.use('/Music', require('./Music'));
