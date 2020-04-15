const app = (module.exports = require('express')());
var express = require('express');
var path = require('path');

const { ReadAllMusics } = require('./../Database/MusicReader/MusicReader');
const { ConnectToDB } = require('./../Database/Db');

ConnectToDB().then(() => {
	//ClearMusics().then(() => {
	ReadAllMusics();
	//});
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../Public/index.html'));
});

var staticPath = path.join(__dirname, '../../Public/');
var musicPath = require('./../Database/MusicReader/MusicReader').MusicsFolder;

app.use(express.static(staticPath));
app.use(express.static(musicPath));

app.use((req, res, next) => {
	console.log();
	console.log('[Path - Log] ' + req.url);
	next();
});

app.use('/Music', require('./Music'));
