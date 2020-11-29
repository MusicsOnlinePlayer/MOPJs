const queue = require('queue');
const NodeID3 = require('node-id3').Promise;
const fs = require('fs');
const path = require('path');
const { CreateUser, GetTrackById, GetDownloadStream } = require('@mopjs/dzdownloadernode');
const { default: Axios } = require('axios');
const { MusicsFolder } = require('../../Config');
const MopConsole = require('../../../Tools/MopConsole');
const { Music } = require('../../Model');
const { CheckIfDeezerReqAreAllowed } = require('../Deezer Proxy');

const LogLocation = 'Musics.Proxy.DeezerProxy.Albums';

class DzDownloader {
	constructor(arlToken) {
		this.downloadQueue = queue();
		this.downloadQueue.concurrency = 1;

		const ProxyConfig = {
			host: process.env.PROXY_HOST,
			port: parseInt(process.env.PROXY_PORT, 10),
		};

		if (process.env.PROXY_HOST) {
			MopConsole.warn(LogLocation, 'Using proxy for deezer download');
			MopConsole.warn(LogLocation, `Host: ${ProxyConfig.host}:${ProxyConfig.port}`);
		}


		CreateUser(arlToken, process.env.PROXY_HOST ? ProxyConfig : undefined)
			.then((User) => {
				this.User = User;
				MopConsole.info(LogLocation, 'Downloader State: Ready');
				this.downloadQueue.autostart = true;
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
			});
	}

	static GetPathFromMusicId(musicId) {
		return path.join(MusicsFolder, `${musicId}.mp3`);
	}

	static async GetFilePath(musicId) {
		const MusicPath = DzDownloader.GetPathFromMusicId(musicId);
		MopConsole.debug(LogLocation, `Saving path ${MusicPath} to db (dz id: ${musicId} )`);
		await Music.findOneAndUpdate({ DeezerId: musicId }, { FilePath: MusicPath });
		MopConsole.debug(LogLocation, `Saved path ${MusicPath} to db (dz id: ${musicId} )`);
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

	static async WriteTagsToBuffer(Buffer, Track) {
		return await NodeID3.write(
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
					imageBuffer: await DzDownloader.GetCoverOfTrack(Track),
				},
			},
			Buffer,
		);
	}


	AddToDownload(musicId) {
		this.downloadQueue.push(
			() => new Promise((resolve, reject) => {
				if (fs.existsSync(path.join(MusicsFolder, `${musicId}.mp3`))) {
					MopConsole.warn(LogLocation, 'Music already downloaded');
					DzDownloader.GetFilePath(musicId).then((MusicPath) => {
						resolve({ MusicPath, MusicDzId: musicId });
					});
					return;
				}

				MopConsole.info(LogLocation, `Starting download of musics id ${musicId}`);
				MopConsole.time(LogLocation, 'Time ');

				this.User.EnsureConnection()
					.then((WasConnected) => {
						if (!WasConnected) {
							MopConsole.warn(LogLocation, 'User was disconnected, logged back in');
						}
						GetTrackById(musicId, this.User)
							.then((track) => {
								MopConsole.debug(LogLocation, `Got track details from api - ${track.Title}`);

								GetDownloadStream(track, this.User).then(async (MusicBuffer) => {
									const TaggedMusicBuffer = await DzDownloader
										.WriteTagsToBuffer(MusicBuffer, track);
									MopConsole.debug(LogLocation, 'Wrote tags to music file');

									const MusicPath = await DzDownloader.GetFilePath(musicId);
									fs.writeFileSync(MusicPath, TaggedMusicBuffer);

									MopConsole.debug(LogLocation, `Saved to ${MusicPath}`);
									MopConsole.info(LogLocation, 'Done.');
									MopConsole.timeEnd(LogLocation, 'Time ');

									resolve({ MusicPath, MusicDzId: musicId });
								});
							})
							.catch((err) => {
								MopConsole.error(LogLocation, ' Fail.');
								MopConsole.error(LogLocation, err);
								reject(err);
							});
					});
			}),
		);
	}

	AddToQueueAsync(musicId) {
		return new Promise((resolve) => {
			this.downloadQueue.on('success', ({ MusicPath, MusicDzId }) => {
				if (MusicDzId === musicId) resolve(MusicPath);
			});
			MopConsole.info(LogLocation, `Added to queue music with id: ${musicId} - Position ${this.downloadQueue.length}`);
			this.AddToDownload(musicId);

			// TODO Implement errors
		});
	}
}

const Downloader = CheckIfDeezerReqAreAllowed()
	? () => {} : new DzDownloader(process.env.MOP_DEEZER_ARL);

module.exports = {
	Downloader,
};
