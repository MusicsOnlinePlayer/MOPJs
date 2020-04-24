const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');

const path = require('path');
const { MusicsFolder, getTags, AddMusicFromDeezer } = require('../Database/MusicReader/MusicReader');

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


const GetPathFromMusicId = (musicId) => path.join(MusicsFolder, `${musicId}.mp3`);

const AddtoDownload = (musicId) => {
	downloadQueue.push(() => new Promise((resolve, reject) => {
		console.log(`[Deezer - Python] Starting download of musics id ${musicId}`);
		console.time('[Deezer - Python] Time ');


		GotEndedMessage()
			.then(async () => {
				console.log('[Deezer - Python] Done.');
				console.timeEnd('[Deezer - Python] Time ');
				console.log('[Deezer - Database] Adding to database');
				const MusicPath = GetPathFromMusicId(musicId);
				const tags = await getTags(MusicPath);
				if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
					AddMusicFromDeezer(musicId, MusicPath)
						.then(() => {
							console.log('[Deezer - Database] Done.');
							resolve(musicId);
						})
						.catch((err) => {
							console.log('[Deezer - Database] Cannot insert');
							console.log(err);
							reject();
						});
				} else {
					console.log('[Deezer - Database] Missing tags');
					reject();
				}
			}).catch((err) => {
				console.log('[Deezer - Python] Fail !');
				console.log(err);
				reject(err);
			});
		SendDownloadMusicPython(musicId);
	}));
};

const AddToQueue = (musicId) => {
	console.log(`[Deezer] Added to queue music with id: ${musicId} - Position ${downloadQueue.length}`);
	if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) { AddtoDownload(musicId); } else console.log('[Deezer] Already exist skipping...');
};

module.exports = {
	AddToQueue,
	AddToQueueAsync: (musicId) => new Promise((resolve, reject) => {
		AddToQueue(musicId);
		downloadQueue.on('success', (result) => {
			if (result === musicId) resolve(GetPathFromMusicId(musicId));
		});
		// TODO Implement errors
	}),
};
