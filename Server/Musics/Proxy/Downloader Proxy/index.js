const { PythonShell } = require('python-shell');
const queue = require('queue');
const fs = require('fs');
const path = require('path');
const { DeezerArlToken } = require('../../../Config/MopConf.json');
const { MusicsFolder } = require('../../Config');
const MopConsole = require('../../../Tools/MopConsole');
const { Music } = require('../../Model');

const LogLocation = 'Musics.Proxy.DeezerProxy.Albums';

class DzDownloader {
	constructor(arlToken) {
		this.downloadQueue = queue();
		this.downloadQueue.concurrency = 1;

		this.PyShell = new PythonShell(path.join(__dirname, 'Deezloader.py'), { args: [MusicsFolder, arlToken] });
		this.PyShell.on('message', (msg) => {
			// MopConsole.info('Python', msg);
			if (msg === 'ready') {
				this.downloadQueue.autostart = true;
				MopConsole.info(LogLocation, 'Downloader State: Ready');
			}
		});
		this.PyShell.on('stderr', (err) => {
			MopConsole.error(LogLocation, 'Internal python script error (see traceback below)');
			MopConsole.error(LogLocation, err);
		});
		this.PyShell.on('error', (err) => {
			MopConsole.error(LogLocation, 'Internal python script error (see traceback below)');
			MopConsole.error(LogLocation, err);
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

	AddToDownload(musicId) {
		this.downloadQueue.push(() => new Promise((resolve, reject) => {
			MopConsole.info(LogLocation, `Starting download of musics id ${musicId}`);
			MopConsole.time(LogLocation, 'Time ');

			if (DzDownloader.CheckIfMusicAlreadyExist(musicId)) {
				MopConsole.warn(LogLocation, 'Already downloaded in this queue');
				return (DzDownloader.GetPathFromMusicId(musicId));
			}

			this.SendDownloadMusicPython(musicId);
			this.GotEndedMessage()
				.then(async () => {
					MopConsole.info(LogLocation, ' Done.');
					MopConsole.timeEnd(LogLocation, 'Time ');
					const MusicPath = DzDownloader.GetPathFromMusicId(musicId);
					MopConsole.debug(LogLocation, `Saving path ${MusicPath} to db (dz id: ${musicId} )`);
					await Music.findOneAndUpdate({ DeezerId: musicId }, { FilePath: MusicPath });
					MopConsole.debug(LogLocation, `Saved path ${MusicPath} to db (dz id: ${musicId} )`);
					resolve({ MusicPath, MusicDzId: musicId });
				}).catch((err) => {
					MopConsole.error(LogLocation, ' Fail.');
					MopConsole.error(LogLocation, err);
					reject(err);
				});
		}));
	}

	AddToQueue(musicId) {
		if (!fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) {
			this.AddToDownload(musicId);
		} else MopConsole.warn(LogLocation, 'Already exist skipping...');
	}

	AddToQueueAsync(musicId) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', ({ MusicPath, MusicDzId }) => {
				if (MusicDzId === musicId) resolve(MusicPath);
			});
			MopConsole.info(LogLocation,
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
