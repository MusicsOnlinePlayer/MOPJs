const express = require('express');
const path = require('path');

module.exports = express();
const app = module.exports;
// const compression = require('compression');
const { DoIndexation } = require('../Database/MusicReader');
const { ConnectToDB } = require('../Database/Db');
// app.use(compression);

ConnectToDB().then(() => {
	// ClearMusics().then(() => {
	DoIndexation();
	// });


	app.use('/User', require('./User'));
	app.use('/Music', require('./Music'));
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../Public/index.html'));
});

const staticPath = path.join(__dirname, '../../Public/');
const { MusicsFolder, ArtistsImageFolder } = require('../Database/MusicReader');

app.use(express.static(staticPath));
app.use(express.static(MusicsFolder));
app.use(express.static(ArtistsImageFolder));


app.use((req, res, next) => {
	console.log();
	console.log(`[Path - Log] ${req.url}`);
	next();
});
