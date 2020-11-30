const queue = require('queue');
const {
	GetTrackById, GetDecryptedStream,
} = require('@mopjs/dzdownloadernode');
const StreamCache = require('stream-cache/lib/StreamCache');
const MopConsole = require('../../../Tools/MopConsole');
const { CheckIfDeezerReqAreAllowed } = require('../Deezer Proxy');
const { GetDownloaderUser } = require('.');

const LogLocation = 'Musics.Proxy.DeezerProxy.Stream';

class StreamQueue {
	constructor() {
		const concurrentJobs = 1;
		MopConsole.info(LogLocation, `Creating Stream Queue with ${concurrentJobs} concurrent jobs`);
		this.downloadQueue = queue();
		this.downloadQueue.concurrency = 1;
		this.StreamCache = {};
		this.Init();
	}

	Init = async () => {
		this.User = await GetDownloaderUser();
		this.downloadQueue.autostart = true;
		MopConsole.info(LogLocation, 'Stream queue: Ready');
	}


	GetStreamFromMusic = (musicId, OutStream, Start, End) => new Promise((resolve) => {
		MopConsole.debug(LogLocation, `Stream requested for ${musicId}`);

		GetTrackById(musicId, this.User)
			.then((track) => {
				MopConsole.debug(LogLocation, `Got track data for ${musicId}`);

				if (this.StreamCache[musicId]) {
					MopConsole.debug(LogLocation, `Stream exist for ${musicId} using cache`);
					resolve({ MusicId: musicId, TotalLength: track.Size, StreamingCache: this.StreamCache[musicId] });
					return;
				}

				this.StreamCache[musicId] = new StreamCache();
				GetDecryptedStream(track, this.User, this.StreamCache[musicId], { Start, End }, () => MopConsole.debug(LogLocation, `Reached end of stream for ${musicId}`))
					.then(async () => {
						MopConsole.debug(LogLocation, `Stream received ${musicId}`);
						resolve({ MusicId: track.Id, TotalLength: track.Size, StreamingCache: this.StreamCache[musicId] });
					});
			})
			.catch((err) => {
				MopConsole.error(LogLocation, ' Fail.');
				MopConsole.error(LogLocation, err);
			});
	})

	PushToQueue = (musicId, OutStream, Start, End) => {
		this.downloadQueue.push(() => new Promise((resolve, reject) => {
			this.GetStreamFromMusic(musicId, OutStream, Start, End)
				.then((d) => resolve(d))
				.catch((e) => reject(e));
		}));
	}

	AddToQueueAsync(musicId, OutStream, Start, End) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (res) => {
				if (parseInt(res.MusicId, 10) === musicId) {
					resolve(res);
				}
			});
			MopConsole.info(LogLocation, `Music added to stream queue (id: ${musicId} | Position ${this.downloadQueue.length})`);

			this.PushToQueue(musicId, OutStream, Start, End);
			// TODO Implement errors
		});
	}
}

const StreamingQueue = CheckIfDeezerReqAreAllowed()
	? () => {} : new StreamQueue();

module.exports = {
	StreamingQueue,
};
