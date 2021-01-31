"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const Model_1 = require("../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../Tools/MopConsole"));
const DB_Proxy_1 = require("../Proxy/DB Proxy");
const DeezerHandler_1 = require("./DeezerHandler");
const Deezer_Proxy_1 = require("../Proxy/Deezer Proxy");
const Handler_1 = require("../../Users/Handler");
const Disk_Proxy_1 = require("../Proxy/Disk Proxy");
const StreamQueue_1 = tslib_1.__importDefault(require("../Proxy/Downloader Proxy/StreamQueue"));
const Location = 'Musics.Handler.DBHandler';
exports.MakeIndexation = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    MopConsole_1.default.info(Location, 'Starting indexing');
    MopConsole_1.default.time(Location, 'Time ');
    const files = Disk_Proxy_1.GetMusicsFiles();
    /* eslint no-restricted-syntax: "off" */
    for (const file of files) {
        let tags;
        try {
            tags = yield Disk_Proxy_1.ReadTagsFromDisk(file);
        }
        catch (err) {
            MopConsole_1.default.warn(Location, `Cannot read tags of music file ${file}`);
        }
        if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
            yield DB_Proxy_1.HandleNewMusicFromDisk(tags, file);
        }
        else {
            MopConsole_1.default.warn(Location, `Skipped ${file} (Missing tags)`);
        }
    }
    MopConsole_1.default.info(Location, `Done - ${files.length} musics on the disk`);
    MopConsole_1.default.timeEnd(Location, 'Time ');
});
// TODO: fix type here
exports.HandleMusicRequestById = (id, UserReq) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for music with db id ${id}`);
    Model_1.Music.findById(id, (err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            MopConsole_1.default.error(Location, err);
            reject(err);
            return;
        }
        if (!doc) {
            MopConsole_1.default.warn(Location, `Music id not found ${id}`);
            reject(new Error(`Music not found for id  ${id}`));
            return;
        }
        const MusicDoc = doc.toObject();
        if (MusicDoc) {
            MopConsole_1.default.debug(Location, `Found music with title ${MusicDoc.Title}`);
            MusicDoc.FilePath = MusicDoc.FilePath
                ? path_1.default.basename(MusicDoc.FilePath) : undefined;
            const AlbumOfMusic = yield DB_Proxy_1.FindAlbumContainingMusic(MusicDoc);
            MusicDoc.Image = AlbumOfMusic.Image;
            MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
            MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
            if (UserReq)
                MusicDoc.IsLiked = yield Handler_1.CheckLikeMusic(UserReq, MusicDoc._id);
        }
        resolve(MusicDoc);
    }));
});
exports.HandleAlbumRequestById = (id) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for album with db id ${id}`);
    Model_1.Album.findById(id)
        .populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
        .exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            MopConsole_1.default.error('Action.Album', err.message);
            reject(err);
            return;
        }
        if (!doc) {
            MopConsole_1.default.warn('Action.Album', `Album id not found ${id}`);
            reject(new Error(`Album not found for id  ${id}`));
            return;
        }
        let AlbumDoc = doc.toObject();
        MopConsole_1.default.debug(Location, `Found album named ${AlbumDoc.Name}`);
        if (AlbumDoc.DeezerId) {
            if (!AlbumDoc.IsComplete) {
                MopConsole_1.default.debug(Location, 'It is an incomplete deezer album, requesting all musics of the album');
                yield DeezerHandler_1.CompleteAlbum(AlbumDoc);
                const newAlbum = yield Model_1.Album.findById(id);
                yield newAlbum.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
                    .execPopulate();
                AlbumDoc = yield newAlbum.toObject();
            }
        }
        resolve(AlbumDoc);
    }));
});
exports.HandleArtistRequestById = (id) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for artist with db id ${id}`);
    Model_1.Artist.findById(id)
        .populate({
        path: 'AlbumsId',
        populate: {
            path: 'MusicsId',
            model: 'Music',
        },
    })
        .exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        let ArtistDoc = doc;
        if (err) {
            MopConsole_1.default.error(Location, err.message);
            reject(err);
            return;
        }
        if (!ArtistDoc) {
            MopConsole_1.default.warn(Location, `Artist id not found ${id}`);
            reject(new Error(`Artist not found for id  ${id}`));
            return;
        }
        MopConsole_1.default.debug(Location, `Found artist named ${ArtistDoc.Name}`);
        if (ArtistDoc.DeezerId) {
            yield DeezerHandler_1.CompleteArtist(ArtistDoc);
            ArtistDoc = yield Model_1.Artist.findById(id).populate({
                path: 'AlbumsId',
                populate: {
                    path: 'MusicsId',
                    model: 'Music',
                },
            });
            if (!ArtistDoc.ImagePath) {
                ArtistDoc.ImagePath = yield Deezer_Proxy_1.GetImageOfArtist(ArtistDoc.DeezerId);
                ArtistDoc.save();
            }
        }
        resolve(ArtistDoc);
    }));
});
exports.HandlePlaylistRequestById = (id) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for playlist with db id ${id}`);
    Model_1.Playlist.findById(id)
        .populate('Creator')
        .populate({
        path: 'MusicsId',
        populate: [{
                path: 'AlbumId',
                model: 'Album',
            }],
    })
        .exec((err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            MopConsole_1.default.error(Location, err.message);
            reject(err);
            return;
        }
        if (!doc) {
            MopConsole_1.default.warn(Location, `Playlist id not found ${id}`);
            reject(new Error(`Playlist not found for id  ${id}`));
        }
        const PlaylistDoc = doc.toObject();
        PlaylistDoc.Image = PlaylistDoc.MusicsId[0].AlbumId.Image;
        PlaylistDoc.ImagePathDeezer = PlaylistDoc.MusicsId[0].AlbumId.ImagePathDeezer;
        PlaylistDoc.ImageFormat = PlaylistDoc.MusicsId[0].AlbumId.ImageFormat;
        resolve(PlaylistDoc);
    }));
});
exports.AddMusicsToPlaylist = (PlaylistId, MusicsId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Adding ${MusicsId} to playlist ${PlaylistId})`);
    Model_1.Playlist.updateOne({ _id: PlaylistId }, { $push: { MusicsId: { $each: MusicsId } } }, { upsert: true }, (err) => {
        if (err) {
            MopConsole_1.default.error(Location, err);
            reject(err);
            return;
        }
        resolve();
    });
});
exports.RemoveMusicOfPlaylist = (PlaylistId, MusicId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Removing ${MusicId} of playlist ${PlaylistId})`);
    Model_1.Playlist.updateOne({ _id: PlaylistId }, { $pullAll: { MusicsId: [MusicId] } }, (err) => {
        if (err) {
            MopConsole_1.default.error(Location, err);
            reject(err);
            return;
        }
        resolve();
    });
});
exports.RemovePlaylistById = (PlaylistId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Deleting playlist (db id: ${PlaylistId})`);
    Model_1.Playlist.deleteOne({ _id: PlaylistId }, (err) => {
        if (err) {
            MopConsole_1.default.error(Location, err);
            reject(err);
            return;
        }
        resolve();
    });
});
exports.GetMusicFilePath = (id, UserReq, RegisterHistory = true) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Getting music file path, db id: ${id} RegisterHistory is set to ${RegisterHistory}`);
    Model_1.Music.findById(id, (err, doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            MopConsole_1.default.error(Location, err);
            reject(err);
            return;
        }
        if (!doc) {
            MopConsole_1.default.warn(Location, `Music id not found ${id}`);
            resolve({});
            return;
        }
        const MusicDoc = doc;
        if (RegisterHistory) {
            MusicDoc.Views += 1;
            MusicDoc.LastView = new Date();
            yield MusicDoc.save();
        }
        if (UserReq && RegisterHistory) {
            yield Handler_1.RegisterToUserHistory(MusicDoc._id, UserReq._id);
        }
        if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
            MopConsole_1.default.debug(Location, `Music file path for db id ${id} is ${MusicDoc.FilePath}`);
            resolve({ FilePath: MusicDoc.FilePath ? path_1.default.basename(MusicDoc.FilePath) : '' });
            return;
        }
        MopConsole_1.default.debug(Location, `Music file path for db id ${id} is not present, using stream instead`);
        resolve({ DeezerId: doc.DeezerId });
    }));
});
exports.GetMusicStream = (id) => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield StreamQueue_1.default.AddToQueueAsync(id); });
exports.IncrementLikeCount = (id, increment = 1) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const music = yield Model_1.Music.findById(id);
    music.Likes += increment;
    yield music.save();
    MopConsole_1.default.debug(Location, `Increased like count of music ${id} by ${increment}`);
});
/** Add multiple deezer formatted music to mongodb
 * @param {Object[]} tags Array of musics from deezer api
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
exports.AddMusicsFromDeezer = (tags) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const MusicDbIds = [];
    for (const musicTags of tags) {
        const DbId = yield DB_Proxy_1.HandleNewMusicFromDz(musicTags);
        MusicDbIds.push(DbId);
    }
    const numberModified = yield DB_Proxy_1.UpdateRanksBulk(tags);
    MopConsole_1.default.info(Location, `Updated ranks of ${numberModified} musics`);
    return MusicDbIds;
});
