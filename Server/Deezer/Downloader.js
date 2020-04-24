const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');

const path = require('path');
const { MusicsFolder, getTags, HandleNewMusic } = require('../Database/MusicReader/MusicReader');

const downloadQueue = queue();
downloadQueue.autostart = true;
downloadQueue.concurrency = 1;

const AddtoDownload = (musicId) => {
	downloadQueue.push(() => new Promise((resolve, reject) => {
		console.log(`[Deezer - Python] Starting download of musics id ${musicId}`);
		console.time('[Deezer - Python] Time ');
		PythonShell.run(path.join(__dirname, 'Deezloader.py'), { args: [musicId, MusicsFolder] },
			async (err) => {
				if (err) {
					console.error('[Deezer - Python] Python Error, see details above');
					console.log(err);
					reject(err);
				}
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
			});
	}));
};


module.exports = {
	AddToQueue: (musicId) => {
		console.log(`[Deezer] Added to queue music with id: ${musicId}`);
		if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) { AddtoDownload(musicId); } else console.log('[Deezer] Already exist skipping...');
	},
};
