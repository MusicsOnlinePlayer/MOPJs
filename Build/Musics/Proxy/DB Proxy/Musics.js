"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMusicToDatabase = exports.UpdateRanksBulk = exports.DoesMusicExistsTitleDzId = exports.DoesMusicExistsTitle = exports.AppendOrUpdateMusicsToAlbum = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Model_1 = require("../../Model");
const Config_1 = require("../../Config");
const LogLocation = 'Musics.Proxy.DB Proxy.Musics';
/** This function performs an update directly on the database to change the track number
 * @param {IMusic} tags - Tags of the music that need to change music id
 */
const UpdateIfNeededTrackNumber = (tags) => new Promise((resolve) => {
    MopConsole_1.default.info(LogLocation, `Updated Track Number of music with dzId ${tags.DeezerId} to ${tags.TrackNumber}`);
    Model_1.Music.findOneAndUpdate({ DeezerId: tags.DeezerId }, { TrackNumber: tags.TrackNumber })
        .then(() => {
        // console.log(`[Music Indexer] Update track number of ${tags.Title}`);
        resolve();
    });
});
/** This function add a new music to an existing album. It will also create and save the music
 * @param {IMusic} tags - Tags for the music that will be saved
 * @param {number} AlbumDzId - Deezer id of the album
 */
const AppendMusicToAlbum = async (tags, AlbumDzId) => {
    const albumDoc = await Model_1.Album.findOne({ Name: tags.Album, DeezerId: AlbumDzId });
    const savedMusic = await Model_1.Music.create({ ...tags, AlbumId: albumDoc._id });
    albumDoc.MusicsId.push(savedMusic._id);
    await albumDoc.save();
    MopConsole_1.default.info(LogLocation, `Added new music to ${albumDoc.Name}`);
};
/** This function decide if a music should be added to an album or just
 * need it's track number to be modified
 * @param {object} tags - Tags of the music
 * @param {number} AlbumDzId - Deezer id of the album
*/
async function AppendOrUpdateMusicToAlbum(tags, AlbumDzId) {
    const count = await Model_1.Music.countDocuments({ Title: tags.Title });
    if (count > 0) {
        await UpdateIfNeededTrackNumber(tags);
    }
    else {
        await AppendMusicToAlbum(tags, AlbumDzId);
    }
}
/** This function decide if multiple musics should be added to an album or just
 * need it's track number to be modified
 * @param {Array<IMusic>} MusicsTags - An array of Music tags
 * @param {number} AlbumDzId - Deezer id of the album
*/
async function AppendOrUpdateMusicsToAlbum(MusicsTags, AlbumDzId) {
    const Tasks = [];
    MusicsTags.forEach((MusicTags) => {
        Tasks.push(AppendOrUpdateMusicToAlbum(MusicTags, AlbumDzId));
    });
    MopConsole_1.default.debug(LogLocation, `Adding or updating ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
    try {
        await Promise.all(Tasks);
    }
    catch (err) {
        MopConsole_1.default.error(LogLocation, err);
    }
    MopConsole_1.default.debug(LogLocation, `Added or updated ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
}
exports.AppendOrUpdateMusicsToAlbum = AppendOrUpdateMusicsToAlbum;
/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @returns {boolean}
 * @deprecated
 */
const DoesMusicExistsTitle = async (Title) => {
    const count = await Model_1.Music.countDocuments({ Title });
    return count > 0;
};
exports.DoesMusicExistsTitle = DoesMusicExistsTitle;
/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @param {number} DeezerId - Deezer Id of the music that need to be checked
 * @returns {Promise<boolean>}
 */
const DoesMusicExistsTitleDzId = async (Title, DeezerId) => {
    const count = await Model_1.Music.countDocuments({ Title, DeezerId });
    return count > 0;
};
exports.DoesMusicExistsTitleDzId = DoesMusicExistsTitleDzId;
const UpdateRanksBulk = async (tags) => {
    if (tags.length === 0)
        return 0;
    const bulk = Model_1.Music.collection.initializeUnorderedBulkOp();
    tags.forEach((tag) => {
        bulk.find({ DeezerId: tag.id }).updateOne({ $set: { Rank: tag.rank } });
    });
    const bulkResult = await bulk.execute();
    return bulkResult.nModified;
};
exports.UpdateRanksBulk = UpdateRanksBulk;
/** This function performs a save of music in the database while adding
 * new artist if it doesn't already exists and also adding a new album if it doesn't already exists.
 * @param {object} MusicTags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicTags.Title - Title of the music
 * @param {number=} MusicTags.DeezerId - Deezer Id
 * @param {string} MusicTags.Artist - Artist Name
 * @param {number=} MusicTags.ArtistDzId - Deezer Id of the music Artist
 * @param {string} MusicTags.Album - Album Name
 * @param {string=} MusicTags.Image - Cover of album in base64
 * @param {string=} MusicTags.ImagePathDeezer - url or path of album cover on deezer
 * @param {string=} MusicTags.ImageFormat - Format of the base64 image
 * @param {string=} ArtistImage - The path of the Artist image
 * @returns {Promise<string>} Music db id of the music saved
 * */
async function AddMusicToDatabase(music, album, artist, ArtistImage = undefined) {
    let guessedPath = `${artist.Name}.jpg`;
    if (!fs_1.default.existsSync(path_1.default.join(Config_1.ArtistsImageFolder, guessedPath))) {
        guessedPath = undefined;
    }
    const newMusic = new Model_1.Music(music);
    const newAlbum = new Model_1.Album(album);
    const newArtist = new Model_1.Artist({
        ...artist,
        ImagePath: ArtistImage || guessedPath,
    });
    let musicDoc;
    try {
        musicDoc = await newMusic.save();
    }
    catch (err) {
        MopConsole_1.default.error(LogLocation, err);
        return;
    }
    const albumDoc = await Model_1.Album.findOneOrCreate({
        Name: newAlbum.Name, $or: [{ DeezerId: newAlbum.DeezerId }, { DeezerId: undefined }],
    }, newAlbum);
    const artistDoc = await Model_1.Artist.findOneOrCreate({ Name: newArtist.Name }, newArtist);
    albumDoc.DeezerId = newAlbum.DeezerId;
    artistDoc.DeezerId = newArtist.DeezerId;
    albumDoc.MusicsId.push(musicDoc._id);
    const savedAlbum = await albumDoc.save();
    if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
        MopConsole_1.default.info(LogLocation, `Added ${savedAlbum.Name}`);
        artistDoc.AlbumsId.push(savedAlbum._id);
        await artistDoc.save();
    }
    musicDoc.AlbumId = savedAlbum._id;
    await musicDoc.save();
    /* eslint consistent-return: "off" */
    return musicDoc._id;
}
exports.AddMusicToDatabase = AddMusicToDatabase;
