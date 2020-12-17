import Queue from 'queue';
import fs from 'fs';
import path from 'path';
import {
	GetTrackById, GetDecryptedStream, User, Track,
} from '@mopjs/dzdownloadernode';
import StreamCache from 'stream-cache';
import Axios from 'axios';
import { Stream } from 'stream';
import { Promise as NodeID3 } from 'node-id3';
import { MusicsFolder } from '../../Config';
import { Music } from '../../Model';
import { CheckIfDeezerReqAreAllowed } from '../Deezer Proxy';
import { GetDownloaderUser } from '.';

import MopConsole from '../../../Tools/MopConsole';
import { isAlbum } from '../../Interfaces';

const LogLocation = 'Musics.Proxy.DeezerProxy.Stream';

export interface IStreamQueueResult {
	MusicId: string,
	TotalLength: number,
	StreamingCache: Stream
}

class StreamQueue {
	downloadQueue: any;

	User: User;

	streamCache: Record<string, {Stream: Stream, Length: number}>;

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
		this.downloadQueue.autostart = true;
		MopConsole.info(LogLocation, 'Stream queue: Ready');
	};

	static GetPathFromMusicId(musicId : number) {
		return path.join(MusicsFolder, `${musicId}.mp3`);
	}

	static async GetFilePath(musicId : number) {
		const MusicPath = StreamQueue.GetPathFromMusicId(musicId);
		await Music.findOneAndUpdate({ DeezerId: musicId }, { FilePath: MusicPath });
		MopConsole.debug(LogLocation, `[${musicId}] Saved path to db`);
		return MusicPath;
	}

	static async GetCoverOfTrack(dzTrack: Track) {
		const music = await Music.findOne({ DeezerId: dzTrack.Id }).populate('AlbumId');
		const Album = isAlbum(music.AlbumId) ? music.AlbumId : undefined;
		if (Album.ImagePathDeezer) {
			const res = await Axios.get(Album.ImagePathDeezer, {
				responseType: 'arraybuffer',
			});
			return res.data;
		}
		return undefined;
	}

	static async WriteTagsToFile(filePath: string, dzTrack : Track) {
		await NodeID3.write(
			{
				title: dzTrack.Title,
				artist: dzTrack.Artist,
				album: dzTrack.Album,
				trackNumber: String(dzTrack.TrackNumber),
				image: {
					mime: 'jpeg',
					type: {
						id: 3,
						name: 'front cover',
					},
					imageBuffer: await StreamQueue.GetCoverOfTrack(dzTrack),
					description: `Cover of ${dzTrack.Title}`,
				},
			},
			filePath,
		);
	}

	OnStreamEnd = async (dzTrack : Track) => {
		const musicId = dzTrack.Id;
		MopConsole.info(LogLocation, `[${musicId}] Stream ended`);

		const FilePath = StreamQueue.GetPathFromMusicId(musicId);

		const ws = fs.createWriteStream(FilePath);

		ws.on('finish', () => {
			MopConsole.info(LogLocation, `[${musicId}] Music file saved`);
			StreamQueue.WriteTagsToFile(FilePath, dzTrack)
				.then(() => MopConsole.info(LogLocation, `[${musicId}] Tags added`));
			StreamQueue.GetFilePath(musicId);
			this.streamCache[musicId] = undefined;
		});

		this.streamCache[musicId].Stream.pipe(ws);
	};

	CheckStreamCacheLength = () => {
		const { length } = Object.keys(this.streamCache);
		if (length > 10) {
			MopConsole.warn(LogLocation, `Stream cache is getting large (${length} tracks)`);
		}
	};

	GetStreamFromMusic = (musicId : number) => new Promise((resolve, reject) => {
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
			.then((track) => {
				if (!track.Size) {
					this.User.EnsureConnection()
						.then(() => {
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

				this.CheckStreamCacheLength();

				GetDecryptedStream(
					track,
					this.User,
					this.streamCache[musicId].Stream,
					() => this.OnStreamEnd(track),
					{ retries: 3 },
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
		this.downloadQueue.push(() => new Promise((resolve, reject) => {
			this.GetStreamFromMusic(musicId)
				.then((d) => resolve(d))
				.catch((e) => reject(e));
		}));
	};

	AddToQueueAsync(musicId: number) : Promise<IStreamQueueResult> {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', (res: IStreamQueueResult) => {
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

export default CheckIfDeezerReqAreAllowed() && process.env.NODE_ENV !== 'test'
	? null : new StreamQueue();
