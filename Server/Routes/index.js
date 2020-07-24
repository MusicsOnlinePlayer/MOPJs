const express = require('express');
const path = require('path');
const MopConsole = require('../Tools/MopConsole');

module.exports = express();
const app = module.exports;
// const compression = require('compression');
app.use((req, res, next) => {
	if (res.statusCode === 404) MopConsole.warn('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);
	else MopConsole.standard('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);

	next();
});
app.use('/User', require('./User'));
app.use('/Music', require('./Music'));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../Public/index.html'));
});

const staticPath = path.join(__dirname, '../../Public/');
const { MusicsFolder, ArtistsImageFolder } = require('../Musics/Config');

app.use(express.static(staticPath));
app.use(express.static(MusicsFolder));
app.use(express.static(ArtistsImageFolder));
app.use(express.static(path.join(__dirname, '../../Public/Dist')));
