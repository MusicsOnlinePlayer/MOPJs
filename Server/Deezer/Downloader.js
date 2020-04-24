const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');

const path = require('path');
const { MusicsFolder, getTags, HandleNewMusic } = require('../Database/MusicReader/MusicReader');

const downloadQueue = queue();
downloadQueue.concurrency = 1;

const PyShell = new PythonShell(path.join(__dirname, 'Deezloader.py'), { args: [MusicsFolder] });


PyShell.on('message', (msg) => {
	if (msg === 'ready') { downloadQueue.start(); }
});


const SendDownloadMusicPython = (musicId) => {
	PyShell.send(JSON.stringify({ type: 1, dl: musicId }));
};

const GotEndedMessage = () => new Promise((resolve, reject) => {
	PyShell.on('message', (msg) => {
		if (msg === 'end') resolve();
		else reject();
	});
});


const AddtoDownload = (musicId) => {
	downloadQueue.push(() => new Promise((resolve, reject) => {
		console.log(`[Deezer - Python] Starting download of musics id ${musicId}`);
		console.time('[Deezer - Python] Time ');


		GotEndedMessage()
			.then(async () => {
				console.log('[Deezer - Python] Done.');
				console.timeEnd('[Deezer - Python] Time ');
				console.log('[Deezer - Database] Adding to database');
				const MusicPath = path.join(MusicsFolder, `${musicId}.mp3`);
				const tags = await getTags(MusicPath);
				if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
					await HandleNewMusic(tags, MusicPath);
				} else {
					console.log('[Deezer - Database] Missing tags');
				}
				console.log('[Deezer - Database] Done.');
				resolve(MusicPath);
			}).catch((err) => {
				console.log('[Deezer - Python] Fail !');
				console.log(err);
				reject(err);
			});
		SendDownloadMusicPython(musicId);
	}));
};


module.exports = {
	AddToQueue: (musicId) => {
		console.log(`[Deezer] Added to queue music with id: ${musicId}`);
		if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) { AddtoDownload(musicId); } else console.log('[Deezer] Already exist skipping...');
	},
};
