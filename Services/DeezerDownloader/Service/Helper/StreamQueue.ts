import Queue from 'queue';
import { GetTrackById, GetDecryptedStream, User, Track } from '@mopjs/dzdownloadernode';
import { Stream, Writable, Transform } from 'stream';
import StreamCache from 'stream-cache';
import { GetDownloaderUser } from './DeezerUser';
import MopConsole from 'lib/MopConsole';
import { Music } from 'lib/Models/Musics';
import MinioClient from '../Minio/Client';
import { ObjectId } from 'mongoose';

const LogLocation = 'Services.DeezerDownloader.Helper.Queue';

export interface IStreamQueueResult {
	MusicId: string;
	TotalLength: number;
	StreamingCache: Stream;
}

class StreamQueue {
	downloadQueue: any;

	User: User;

	streamCache: Record<string, { Stream: Transform; Length: number }>;

	constructor() {
		const concurrentJobs = 1;
		MopConsole.info(LogLocation, `Creating Stream Queue with ${concurrentJobs} concurrent jobs`);
		this.downloadQueue = new Queue();
		this.downloadQueue.concurrency = 1;
		this.streamCache = {};
		this.Init();
	}

	Init = async () => {
		this.User = await GetDownloaderUser();
		if (!(await MinioClient.bucketExists('mopmusics'))) {
			await MinioClient.makeBucket('mopmusics', 'us-east-1');
			MopConsole.info(LogLocation, `Created s3 bucket mopmusics`);
		}
		this.downloadQueue.autostart = true;
		MopConsole.info(LogLocation, 'Stream queue: Ready');
	};

	OnStreamEnd = async (dzTrack: Track) => {
		const musicId = dzTrack.Id;
		const id = `${(await Music.findOne({ DeezerId: musicId }))._id}.mp3`;
		MopConsole.info(LogLocation, `[${musicId}] Stream ended`);

		const Options = {
			'Content-Type': 'audio/mpeg',
		};
		console.log(Stream);
		await MinioClient.putObject(
			'mopmusics',
			id,
			this.streamCache[musicId].Stream,
			this.streamCache[musicId].Length,
			Options
		);
		MopConsole.info(LogLocation, `Uploaded ${id} to minio`);
	};

	GetStreamFromMusic = (musicId: number) =>
		new Promise((resolve, reject) => {
			MopConsole.debug(LogLocation, `[${musicId}] Stream requested`);

			if (this.streamCache[musicId]) {
				MopConsole.debug(LogLocation, `[${musicId}] Stream received (cache)`);
				resolve({
					MusicId: musicId,
					TotalLength: this.streamCache[musicId].Length,
					StreamingCache: this.streamCache[musicId].Stream,
				});
				return;
			}

			GetTrackById(musicId, this.User, { retries: 3 })
				.then(async (track) => {
					if (!track.Size) {
						this.User.EnsureConnection().then(() => {
							MopConsole.warn(LogLocation, 'Client was disconnected, now connected');
							this.GetStreamFromMusic(musicId)
								.then((d) => resolve(d))
								.catch((e) => reject(e));
						});
						return;
					}

					MopConsole.debug(LogLocation, `[${musicId}] Got track data`);

					this.streamCache[musicId] = {
						Stream: new StreamCache(),
						Length: track.Size,
					};

					GetDecryptedStream(
						track,
						this.User,
						this.streamCache[musicId].Stream,
						() => this.OnStreamEnd(track),
						{ retries: 3 }
					)
						.then(async () => {
							MopConsole.debug(LogLocation, `[${musicId}] Stream received`);
							resolve({
								MusicId: track.Id,
								TotalLength: track.Size,
								StreamingCache: this.streamCache[musicId].Stream,
							});
						})
						.catch((err) => reject(err));
				})
				.catch((err) => {
					reject(err);
				});
		});

	PushToQueue = (musicId: number) => {
		this.downloadQueue.push(
			() =>
				new Promise((resolve, reject) => {
					this.GetStreamFromMusic(musicId)
						.then((d) => resolve(d))
						.catch((e) => reject(e));
				})
		);
	};

	AddToQueueAsync(musicId: number): Promise<IStreamQueueResult> {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (res: IStreamQueueResult) => {
				if (parseInt(res.MusicId, 10) === musicId) {
					MopConsole.info(LogLocation, `Success ${res.TotalLength} length for ${res.MusicId}`);
					resolve(res);
				}
			});
			MopConsole.info(
				LogLocation,
				`Music added to stream queue (id: ${musicId} | Position ${this.downloadQueue.length})`
			);

			this.PushToQueue(musicId);
			// TODO Implement errors
		});
	}
}

export default process.env.NODE_ENV === 'test' ? null : new StreamQueue();
