"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Albums_1 = require("./Albums");
exports.FindAlbumContainingMusic = Albums_1.FindAlbumContainingMusic;
exports.HandleAlbumsFromDz = Albums_1.HandleAlbumsFromDz;
exports.UpdateAlbumCompleteStatus = Albums_1.UpdateAlbumCompleteStatus;
const Musics_1 = require("./Musics");
exports.AppendOrUpdateMusicsToAlbum = Musics_1.AppendOrUpdateMusicsToAlbum;
exports.UpdateRanksBulk = Musics_1.UpdateRanksBulk;
const Tags_1 = require("../../Tags");
/** This function add a new music with tags coming from ID3 file.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicFilePath
 */
exports.HandleNewMusicFromDisk = (tags, MusicFilePath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (yield Musics_1.DoesMusicExistsTitle(tags.title))
        return;
    const diskImport = Tags_1.ConvertTagsFromDisk(tags, MusicFilePath);
    yield Musics_1.AddMusicToDatabase(diskImport.ImportedMusic, diskImport.ImportedAlbum, diskImport.ImportedArtist);
});
/** This function add a new music with tags coming from deezer API.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @returns {Promise<ObjectId>} Promise resolve by Music db id
 */
exports.HandleNewMusicFromDz = (tags) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (yield Musics_1.DoesMusicExistsTitleDzId(tags.title, tags.id)) {
        return;
    }
    /* eslint consistent-return: "off" */
    const deezerImport = Tags_1.ConvertTagsFromDz(tags, tags.id);
    return yield Musics_1.AddMusicToDatabase(deezerImport.ImportedMusic, deezerImport.ImportedAlbum, deezerImport.ImportedArtist, tags.artist.picture_big);
});
