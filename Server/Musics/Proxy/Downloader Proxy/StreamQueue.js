const queue = require('queue');
const fs = require('fs');
const NodeID3 = require('node-id3').Promise;
const path = require('path');
const {
	GetTrackById, GetDecryptedStream,
} = require('@mopjs/dzdownloadernode');
const StreamCache = require('stream-cache/lib/StreamCache');
const { default: Axios } = require('axios');
const { MusicsFolder } = require('../../Config');
const { Music } = require('../../Model');
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

	static GetPathFromMusicId(musicId) {
		return path.join(MusicsFolder, `${musicId}.mp3`);
	}

	static async GetFilePath(musicId) {
		const MusicPath = StreamQueue.GetPathFromMusicId(musicId);
		await Music.findOneAndUpdate({ DeezerId: musicId }, { FilePath: MusicPath });
		MopConsole.debug(LogLocation, `[${musicId}] Saved path to db`);
		return MusicPath;
	}

	static async GetCoverOfTrack(Track) {
		const music = await Music.findOne({ DeezerId: Track.Id }).populate('AlbumId');
		if (music.AlbumId.ImagePathDeezer) {
			const res = await Axios.get(music.AlbumId.ImagePathDeezer, {
				responseType: 'arraybuffer',
			});
			return res.data;
		}
		return undefined;
	}

	static async WriteTagsToFile(filePath, Track) {
		await NodeID3.write(
			{
				title: Track.Title,
				artist: Track.Artist,
				album: Track.Album,
				trackNumber: Track.TrackNumber,
				image: {
					mime: 'jpeg',
					type: {
						id: 3,
						name: 'front cover',
					},
					imageBuffer: await StreamQueue.GetCoverOfTrack(Track),
				},
			},
			filePath,
		);
	}

	OnStreamEnd = async (Track) => {
		const musicId = Track.Id;
		MopConsole.info(LogLocation, `[${musicId}] Stream ended`);

		const FilePath = StreamQueue.GetPathFromMusicId(musicId);

		const ws = fs.createWriteStream(FilePath);

		ws.on('finish', () => {
			MopConsole.info(LogLocation, `[${musicId}] Music file saved`);
			StreamQueue.WriteTagsToFile(FilePath, Track)
				.then(() => MopConsole.info(LogLocation, `[${musicId}] Tags added`));
			StreamQueue.GetFilePath(musicId);
			this.StreamCache[musicId] = undefined;
		});

		this.StreamCache[musicId].Stream.pipe(ws);
	}

	CheckStreamCacheLength = () => {
		const { length } = Object.keys(this.StreamCache);
		if (length > 10) {
			MopConsole.warn(LogLocation, `Stream cache is getting large (${length} tracks)`);
		}
	}

	GetStreamFromMusic = (musicId) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `[${musicId}] Stream requested`);

		if (this.StreamCache[musicId]) {
			MopConsole.debug(LogLocation, `[${musicId}] Stream received (cache)`);
			resolve({
				MusicId: musicId,
				TotalLength: this.StreamCache[musicId].Length,
				StreamingCache: this.StreamCache[musicId].Stream,
			});
			return;
		}

		GetTrackById(musicId, this.User, { retries: 3 })
			.then((track) => {
				MopConsole.debug(LogLocation, `[${musicId}] Got track data`);

				this.StreamCache[musicId] = {
					Stream: new StreamCache(),
					Length: track.Size,
				};

				this.CheckStreamCacheLength();

				GetDecryptedStream(
					track,
					this.User,
					this.StreamCache[musicId].Stream,
					() => this.OnStreamEnd(track),
					{ retries: 3 },
				)
					.then(async () => {
						MopConsole.debug(LogLocation, `[${musicId}] Stream received`);
						resolve({
							MusicId: track.Id,
							TotalLength: track.Size,
							StreamingCache: this.StreamCache[musicId].Stream,
						});
					})
					.catch((err) => reject(err));
			})
			.catch((err) => {
				reject(err);
			});
	})

	PushToQueue = (musicId) => {
		this.downloadQueue.push(() => new Promise((resolve, reject) => {
			this.GetStreamFromMusic(musicId)
				.then((d) => resolve(d))
				.catch((e) => reject(e));
		}));
	}

	AddToQueueAsync(musicId) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (res) => {
				if (parseInt(res.MusicId, 10) === musicId) {
					resolve(res);
				}
			});
			MopConsole.info(LogLocation, `Music added to stream queue (id: ${musicId} | Position ${this.downloadQueue.length})`);

			this.PushToQueue(musicId);
			// TODO Implement errors
		});
	}
}
const StreamingQueue = CheckIfDeezerReqAreAllowed()
	? () => {} : new StreamQueue();

module.exports = {
	StreamingQueue,
};
