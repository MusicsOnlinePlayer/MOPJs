"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddMusicToDatabase = exports.DoesMusicExistsTitleDzId = exports.DoesMusicExistsTitle = exports.AppendOrUpdateMusicsToAlbum = void 0;
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
const AppendMusicToAlbum = (tags, AlbumDzId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const albumDoc = yield Model_1.Album.findOne({ Name: tags.Album, DeezerId: AlbumDzId });
    const savedMusic = yield Model_1.Music.create(Object.assign(Object.assign({}, tags), { AlbumId: albumDoc._id }));
    albumDoc.MusicsId.push(savedMusic._id);
    yield albumDoc.save();
    MopConsole_1.default.info(LogLocation, `Added new music to ${albumDoc.Name}`);
});
/** This function decide if a music should be added to an album or just
 * need it's track number to be modified
 * @param {object} tags - Tags of the music
 * @param {number} AlbumDzId - Deezer id of the album
*/
function AppendOrUpdateMusicToAlbum(tags, AlbumDzId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const count = yield Model_1.Music.countDocuments({ Title: tags.Title });
        if (count > 0) {
            yield UpdateIfNeededTrackNumber(tags);
        }
        else {
            yield AppendMusicToAlbum(tags, AlbumDzId);
        }
    });
}
/** This function decide if multiple musics should be added to an album or just
 * need it's track number to be modified
 * @param {Array<IMusic>} MusicsTags - An array of Music tags
 * @param {number} AlbumDzId - Deezer id of the album
*/
function AppendOrUpdateMusicsToAlbum(MusicsTags, AlbumDzId) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const Tasks = [];
        MusicsTags.forEach((MusicTags) => {
            Tasks.push(AppendOrUpdateMusicToAlbum(MusicTags, AlbumDzId));
        });
        MopConsole_1.default.debug(LogLocation, `Adding or updating ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
        try {
            yield Promise.all(Tasks);
        }
        catch (err) {
            MopConsole_1.default.error(LogLocation, err);
        }
        MopConsole_1.default.debug(LogLocation, `Added or updated ${Tasks.length} musics to album with Deezer id: ${AlbumDzId}`);
    });
}
exports.AppendOrUpdateMusicsToAlbum = AppendOrUpdateMusicsToAlbum;
/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @returns {boolean}
 * @deprecated
 */
const DoesMusicExistsTitle = (Title) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const count = yield Model_1.Music.countDocuments({ Title });
    return count > 0;
});
exports.DoesMusicExistsTitle = DoesMusicExistsTitle;
/** This function checks if a music exist in the MongoDB database
 * @param {string} Title - Title of the music that need to be checked
 * @param {number} DeezerId - Deezer Id of the music that need to be checked
 * @returns {Promise<boolean>}
 */
const DoesMusicExistsTitleDzId = (Title, DeezerId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const count = yield Model_1.Music.countDocuments({ Title, DeezerId });
    return count > 0;
});
exports.DoesMusicExistsTitleDzId = DoesMusicExistsTitleDzId;
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
function AddMusicToDatabase(music, album, artist, ArtistImage = undefined) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        let guessedPath = `${artist.Name}.jpg`;
        if (!fs_1.default.existsSync(path_1.default.join(Config_1.ArtistsImageFolder, guessedPath))) {
            guessedPath = undefined;
        }
        const newMusic = new Model_1.Music(music);
        const newAlbum = new Model_1.Album(album);
        const newArtist = new Model_1.Artist(Object.assign(Object.assign({}, artist), { ImagePath: ArtistImage || guessedPath }));
        let musicDoc;
        try {
            musicDoc = yield newMusic.save();
        }
        catch (err) {
            MopConsole_1.default.error(LogLocation, err);
            return;
        }
        const albumDoc = yield Model_1.Album.findOneOrCreate({
            Name: newAlbum.Name, $or: [{ DeezerId: newAlbum.DeezerId }, { DeezerId: undefined }],
        }, newAlbum);
        const artistDoc = yield Model_1.Artist.findOneOrCreate({ Name: newArtist.Name }, newArtist);
        albumDoc.DeezerId = newAlbum.DeezerId;
        artistDoc.DeezerId = newArtist.DeezerId;
        albumDoc.MusicsId.push(musicDoc._id);
        const savedAlbum = yield albumDoc.save();
        if (artistDoc.AlbumsId.indexOf(savedAlbum._id) === -1) {
            MopConsole_1.default.info(LogLocation, `Added ${savedAlbum.Name}`);
            artistDoc.AlbumsId.push(savedAlbum._id);
            yield artistDoc.save();
        }
        musicDoc.AlbumId = savedAlbum._id;
        yield musicDoc.save();
        /* eslint consistent-return: "off" */
        return musicDoc._id;
    });
}
exports.AddMusicToDatabase = AddMusicToDatabase;
//# sourceMappingURL=Musics.js.map