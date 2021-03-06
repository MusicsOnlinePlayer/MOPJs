"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMusicsFromDeezer = exports.IncrementLikeCount = exports.GetMusicStream = exports.GetMusicFilePath = exports.RemovePlaylistById = exports.RemoveMusicOfPlaylist = exports.AddMusicsToPlaylist = exports.HandlePlaylistRequestById = exports.HandleArtistRequestById = exports.HandleAlbumRequestById = exports.HandleMusicRequestById = exports.MakeIndexation = void 0;
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
const MakeIndexation = async () => {
    MopConsole_1.default.info(Location, 'Starting indexing');
    MopConsole_1.default.time(Location, 'Time ');
    const files = Disk_Proxy_1.GetMusicsFiles();
    /* eslint no-restricted-syntax: "off" */
    for (const file of files) {
        let tags;
        try {
            tags = await Disk_Proxy_1.ReadTagsFromDisk(file);
        }
        catch (err) {
            MopConsole_1.default.warn(Location, `Cannot read tags of music file ${file}`);
        }
        if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
            await DB_Proxy_1.HandleNewMusicFromDisk(tags, file);
        }
        else {
            MopConsole_1.default.warn(Location, `Skipped ${file} (Missing tags)`);
        }
    }
    MopConsole_1.default.info(Location, `Done - ${files.length} musics on the disk`);
    MopConsole_1.default.timeEnd(Location, 'Time ');
};
exports.MakeIndexation = MakeIndexation;
// TODO: fix type here
const HandleMusicRequestById = (id, UserReq) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for music with db id ${id}`);
    Model_1.Music.findById(id, async (err, doc) => {
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
            const AlbumOfMusic = await DB_Proxy_1.FindAlbumContainingMusic(MusicDoc);
            MusicDoc.Image = AlbumOfMusic.Image;
            MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
            MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
            if (UserReq)
                MusicDoc.IsLiked = await Handler_1.CheckLikeMusic(UserReq, MusicDoc._id);
        }
        resolve(MusicDoc);
    });
});
exports.HandleMusicRequestById = HandleMusicRequestById;
const HandleAlbumRequestById = (id) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for album with db id ${id}`);
    Model_1.Album.findById(id)
        .populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
        .exec(async (err, doc) => {
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
                await DeezerHandler_1.CompleteAlbum(AlbumDoc);
                const newAlbum = await Model_1.Album.findById(id);
                await newAlbum.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
                    .execPopulate();
                AlbumDoc = await newAlbum.toObject();
            }
        }
        resolve(AlbumDoc);
    });
});
exports.HandleAlbumRequestById = HandleAlbumRequestById;
const HandleArtistRequestById = (id) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Searching for artist with db id ${id}`);
    Model_1.Artist.findById(id)
        .populate({
        path: 'AlbumsId',
        populate: {
            path: 'MusicsId',
            model: 'Music',
        },
    })
        .exec(async (err, doc) => {
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
            await DeezerHandler_1.CompleteArtist(ArtistDoc);
            ArtistDoc = await Model_1.Artist.findById(id).populate({
                path: 'AlbumsId',
                populate: {
                    path: 'MusicsId',
                    model: 'Music',
                },
            });
            if (!ArtistDoc.ImagePath) {
                ArtistDoc.ImagePath = await Deezer_Proxy_1.GetImageOfArtist(ArtistDoc.DeezerId);
                ArtistDoc.save();
            }
        }
        resolve(ArtistDoc);
    });
});
exports.HandleArtistRequestById = HandleArtistRequestById;
const HandlePlaylistRequestById = (id) => new Promise((resolve, reject) => {
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
        .exec(async (err, doc) => {
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
    });
});
exports.HandlePlaylistRequestById = HandlePlaylistRequestById;
const AddMusicsToPlaylist = (PlaylistId, MusicsId) => new Promise((resolve, reject) => {
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
exports.AddMusicsToPlaylist = AddMusicsToPlaylist;
const RemoveMusicOfPlaylist = (PlaylistId, MusicId) => new Promise((resolve, reject) => {
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
exports.RemoveMusicOfPlaylist = RemoveMusicOfPlaylist;
const RemovePlaylistById = (PlaylistId) => new Promise((resolve, reject) => {
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
exports.RemovePlaylistById = RemovePlaylistById;
const GetMusicFilePath = (id, UserReq, RegisterHistory = true) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(Location, `Getting music file path, db id: ${id} RegisterHistory is set to ${RegisterHistory}`);
    Model_1.Music.findById(id, async (err, doc) => {
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
            await MusicDoc.save();
        }
        if (UserReq && RegisterHistory) {
            await Handler_1.RegisterToUserHistory(MusicDoc._id, UserReq._id);
        }
        if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
            MopConsole_1.default.debug(Location, `Music file path for db id ${id} is ${MusicDoc.FilePath}`);
            resolve({ FilePath: MusicDoc.FilePath ? path_1.default.basename(MusicDoc.FilePath) : '' });
            return;
        }
        MopConsole_1.default.debug(Location, `Music file path for db id ${id} is not present, using stream instead`);
        resolve({ DeezerId: doc.DeezerId });
    });
});
exports.GetMusicFilePath = GetMusicFilePath;
const GetMusicStream = async (id) => await StreamQueue_1.default.AddToQueueAsync(id);
exports.GetMusicStream = GetMusicStream;
const IncrementLikeCount = async (id, increment = 1) => {
    const music = await Model_1.Music.findById(id);
    music.Likes += increment;
    await music.save();
    MopConsole_1.default.debug(Location, `Increased like count of music ${id} by ${increment}`);
};
exports.IncrementLikeCount = IncrementLikeCount;
/** Add multiple deezer formatted music to mongodb
 * @param {Object[]} tags Array of musics from deezer api
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
const AddMusicsFromDeezer = async (tags) => {
    const MusicDbIds = [];
    for (const musicTags of tags) {
        const DbId = await DB_Proxy_1.HandleNewMusicFromDz(musicTags);
        MusicDbIds.push(DbId);
    }
    const numberModified = await DB_Proxy_1.UpdateRanksBulk(tags);
    MopConsole_1.default.info(Location, `Updated ranks of ${numberModified} musics`);
    return MusicDbIds;
};
exports.AddMusicsFromDeezer = AddMusicsFromDeezer;
