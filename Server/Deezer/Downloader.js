const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');
const path = require('path');
const { DeezerArlToken } = require('../Config/MopConf.json');
const { MusicsFolder, getTags, AddMusicFromDeezer } = require('../Database/MusicReader/MusicReader');


class DzDownloader {
	constructor(arlToken) {
		this.downloadQueue = queue();
		this.downloadQueue.concurrency = 1;

		this.PyShell = new PythonShell(path.join(__dirname, 'Deezloader.py'), { args: [MusicsFolder, arlToken] });
		this.PyShell.on('message', (msg) => {
			console.log(`[Python] ${msg}`);
			if (msg === 'ready') { this.downloadQueue.autostart = true; }
		});
	}

	SendDownloadMusicPython(musicId) {
		this.PyShell.send(JSON.stringify({ type: 1, dl: musicId }));
	}

	GotEndedMessage() {
		return new Promise((resolve, reject) => {
			this.PyShell.on('message', (msg) => {
				if (msg === 'end') resolve();
				else reject();
			});
		});
	}

	static GetPathFromMusicId(musicId) {
		return path.join(MusicsFolder, `${musicId}.mp3`);
	}

	static CheckIfMusicAlreadyExist(musicId) {
		if (fs.existsSync(DzDownloader.GetPathFromMusicId(musicId))) { return true; }
		return undefined;
	}

	AddtoDownload(musicId) {
		this.downloadQueue.push(() => new Promise((resolve, reject) => {
			console.log(`[Deezer - Python] Starting download of musics id ${musicId}`);
			console.time('[Deezer - Python] Time ');

			if (DzDownloader.CheckIfMusicAlreadyExist(musicId)) {
				console.time('[Deezer - Python] Already downloaded in this queue');
				return (DzDownloader.GetPathFromMusicId(musicId));
			}

			this.SendDownloadMusicPython(musicId);
			this.GotEndedMessage()
				.then(async () => {
					console.log('[Deezer - Python] Done.');
					console.timeEnd('[Deezer - Python] Time ');
					console.log('[Deezer - Database] Adding to database');
					const MusicPath = DzDownloader.GetPathFromMusicId(musicId);
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
		}));
	}

	AddToQueue(musicId) {
		if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) { this.AddtoDownload(musicId); } else console.log('[Deezer] Already exist skipping...');
	}

	AddToQueueAsync(musicId) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (result) => {
				if (result === musicId) resolve(path.basename(DzDownloader.GetPathFromMusicId(musicId)));
			});
			console.log(`[Deezer] Added to queue music with id: ${musicId} - Position ${this.downloadQueue.length}`);
			this.AddToQueue(musicId);

		// TODO Implement errors
		});
	}
}

const Downloader = new DzDownloader(DeezerArlToken);

module.exports = {
	Downloader,
};
