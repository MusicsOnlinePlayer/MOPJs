const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');
const path = require('path');
const MopConsole = require('../Tools/MopConsole');
const { DeezerArlToken } = require('../Config/MopConf.json');
const { MusicsFolder, ReadTags, RegisterDownloadedFile } = require('../Database/MusicReader');


class DzDownloader {
	constructor(arlToken) {
		this.downloadQueue = queue();
		this.downloadQueue.concurrency = 1;

		this.PyShell = new PythonShell(path.join(__dirname, 'Deezloader.py'), { args: [MusicsFolder, arlToken] });
		this.PyShell.on('message', (msg) => {
			// MopConsole.info('Python', msg);
			if (msg === 'ready') {
				this.downloadQueue.autostart = true;
				MopConsole.info('DzDownloader.Python', 'Downloader State: Ready');
			}
		});
		this.PyShell.on('stderr', (err) => {
			MopConsole.error('DzDownloader.Python', 'Internal python script error (see traceback below)');
			MopConsole.error('DzDownloader.Python', err);
		});
		this.PyShell.on('error', (err) => {
			MopConsole.error('DzDownloader.Python', 'Internal python script error (see traceback below)');
			MopConsole.error('DzDownloader.Python', err);
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
			MopConsole.info('DzDownloader.Download', `Starting download of musics id ${musicId}`);
			MopConsole.time('DzDownloader.Download', 'Time ');

			if (DzDownloader.CheckIfMusicAlreadyExist(musicId)) {
				MopConsole.warn('DzDownloader.Download', 'Already downloaded in this queue');
				return (DzDownloader.GetPathFromMusicId(musicId));
			}

			this.SendDownloadMusicPython(musicId);
			this.GotEndedMessage()
				.then(async () => {
					MopConsole.info('DzDownloader.Download', ' Done.');
					MopConsole.timeEnd('DzDownloader.Download', 'Time ');
					MopConsole.info('DzDownloader.DataBase', 'Adding to database');
					const MusicPath = DzDownloader.GetPathFromMusicId(musicId);
					const tags = await ReadTags(MusicPath);
					if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
						RegisterDownloadedFile(musicId, MusicPath)
							.then(() => {
								MopConsole.info('DzDownloader.DataBase', ' Done.');
								resolve(musicId);
							})
							.catch((err) => {
								MopConsole.error('DzDownloader.DataBase', 'Cannot insert');
								MopConsole.error('DzDownloader.DataBase', err);
								reject();
							});
					} else {
						MopConsole.error('DzDownloader.Download', 'Missing tags');
						reject();
					}
				}).catch((err) => {
					MopConsole.error('DzDownloader.Download', ' Fail.');
					MopConsole.error('DzDownloader.Download', err);
					reject(err);
				});
		}));
	}

	AddToQueue(musicId) {
		if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) {
			this.AddtoDownload(musicId);
		} else MopConsole.warn('DzDownloader.Download', 'Already exist skipping...');
	}

	AddToQueueAsync(musicId) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (result) => {
				if (result === musicId) resolve(path.basename(DzDownloader.GetPathFromMusicId(musicId)));
			});
			MopConsole.info('DzDownloader.Download',
				`Added to queue music with id: ${musicId} - Position ${this.downloadQueue.length}`);
			this.AddToQueue(musicId);

		// TODO Implement errors
		});
	}
}

const Downloader = new DzDownloader(DeezerArlToken);

module.exports = {
	Downloader,
};
