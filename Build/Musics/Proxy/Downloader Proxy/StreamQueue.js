"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const queue_1 = tslib_1.__importDefault(require("queue"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const dzdownloadernode_1 = require("@mopjs/dzdownloadernode");
const stream_cache_1 = tslib_1.__importDefault(require("stream-cache"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const node_id3_1 = require("node-id3");
const Config_1 = require("../../Config");
const Model_1 = require("../../Model");
const Deezer_Proxy_1 = require("../Deezer Proxy");
const _1 = require(".");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Interfaces_1 = require("../../Interfaces");
const LogLocation = 'Musics.Proxy.DeezerProxy.Stream';
class StreamQueue {
    constructor() {
        this.Init = async () => {
            this.User = await _1.GetDownloaderUser();
            this.downloadQueue.autostart = true;
            MopConsole_1.default.info(LogLocation, 'Stream queue: Ready');
        };
        this.OnStreamEnd = async (dzTrack) => {
            const musicId = dzTrack.Id;
            MopConsole_1.default.info(LogLocation, `[${musicId}] Stream ended`);
            const FilePath = StreamQueue.GetPathFromMusicId(musicId);
            const ws = fs_1.default.createWriteStream(FilePath);
            ws.on('finish', () => {
                MopConsole_1.default.info(LogLocation, `[${musicId}] Music file saved`);
                StreamQueue.WriteTagsToFile(FilePath, dzTrack)
                    .then(() => MopConsole_1.default.info(LogLocation, `[${musicId}] Tags added`));
                StreamQueue.GetFilePath(musicId);
                this.streamCache[musicId] = undefined;
            });
            this.streamCache[musicId].Stream.pipe(ws);
        };
        this.CheckStreamCacheLength = () => {
            const { length } = Object.keys(this.streamCache);
            if (length > 10) {
                MopConsole_1.default.warn(LogLocation, `Stream cache is getting large (${length} tracks)`);
            }
        };
        this.GetStreamFromMusic = (musicId) => new Promise((resolve, reject) => {
            MopConsole_1.default.debug(LogLocation, `[${musicId}] Stream requested`);
            if (this.streamCache[musicId]) {
                MopConsole_1.default.debug(LogLocation, `[${musicId}] Stream received (cache)`);
                resolve({
                    MusicId: musicId,
                    TotalLength: this.streamCache[musicId].Length,
                    StreamingCache: this.streamCache[musicId].Stream,
                });
                return;
            }
            dzdownloadernode_1.GetTrackById(musicId, this.User, { retries: 3 })
                .then((track) => {
                if (!track.Size) {
                    this.User.EnsureConnection()
                        .then(() => {
                        MopConsole_1.default.warn(LogLocation, 'Client was disconnected, now connected');
                        this.GetStreamFromMusic(musicId)
                            .then((d) => resolve(d))
                            .catch((e) => reject(e));
                    });
                    return;
                }
                MopConsole_1.default.debug(LogLocation, `[${musicId}] Got track data`);
                this.streamCache[musicId] = {
                    Stream: new stream_cache_1.default(),
                    Length: track.Size,
                };
                this.CheckStreamCacheLength();
                dzdownloadernode_1.GetDecryptedStream(track, this.User, this.streamCache[musicId].Stream, () => this.OnStreamEnd(track), { retries: 3 })
                    .then(async () => {
                    MopConsole_1.default.debug(LogLocation, `[${musicId}] Stream received`);
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
        this.PushToQueue = (musicId) => {
            this.downloadQueue.push(() => new Promise((resolve, reject) => {
                this.GetStreamFromMusic(musicId)
                    .then((d) => resolve(d))
                    .catch((e) => reject(e));
            }));
        };
        const concurrentJobs = 1;
        MopConsole_1.default.info(LogLocation, `Creating Stream Queue with ${concurrentJobs} concurrent jobs`);
        this.downloadQueue = new queue_1.default();
        this.downloadQueue.concurrency = 1;
        this.streamCache = {};
        this.Init();
    }
    static GetPathFromMusicId(musicId) {
        return path_1.default.join(Config_1.MusicsFolder, `${musicId}.mp3`);
    }
    static async GetFilePath(musicId) {
        const MusicPath = StreamQueue.GetPathFromMusicId(musicId);
        await Model_1.Music.findOneAndUpdate({ DeezerId: musicId }, { FilePath: MusicPath });
        MopConsole_1.default.debug(LogLocation, `[${musicId}] Saved path to db`);
        return MusicPath;
    }
    static async GetCoverOfTrack(dzTrack) {
        const music = await Model_1.Music.findOne({ DeezerId: dzTrack.Id }).populate('AlbumId');
        const Album = Interfaces_1.isAlbum(music.AlbumId) ? music.AlbumId : undefined;
        if (Album.ImagePathDeezer) {
            const res = await axios_1.default.get(Album.ImagePathDeezer, {
                responseType: 'arraybuffer',
            });
            return res.data;
        }
        return undefined;
    }
    static async WriteTagsToFile(filePath, dzTrack) {
        await node_id3_1.Promise.write({
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
        }, filePath);
    }
    AddToQueueAsync(musicId) {
        return new Promise((resolve) => {
            this.downloadQueue.on('success', (res) => {
                if (parseInt(res.MusicId, 10) === musicId) {
                    resolve(res);
                }
            });
            MopConsole_1.default.info(LogLocation, `Music added to stream queue (id: ${musicId} | Position ${this.downloadQueue.length})`);
            this.PushToQueue(musicId);
            // TODO Implement errors
        });
    }
}
exports.default = Deezer_Proxy_1.CheckIfDeezerReqAreAllowed() && process.env.NODE_ENV !== 'test'
    ? null : new StreamQueue();
