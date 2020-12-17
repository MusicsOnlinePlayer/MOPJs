"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAlbumCompleteStatus = exports.AppendOrUpdateMusicsToAlbum = exports.HandleAlbumsFromDz = exports.FindAlbumContainingMusic = exports.HandleNewMusicFromDz = exports.HandleNewMusicFromDisk = void 0;
const tslib_1 = require("tslib");
const Albums_1 = require("./Albums");
Object.defineProperty(exports, "FindAlbumContainingMusic", { enumerable: true, get: function () { return Albums_1.FindAlbumContainingMusic; } });
Object.defineProperty(exports, "HandleAlbumsFromDz", { enumerable: true, get: function () { return Albums_1.HandleAlbumsFromDz; } });
Object.defineProperty(exports, "UpdateAlbumCompleteStatus", { enumerable: true, get: function () { return Albums_1.UpdateAlbumCompleteStatus; } });
const Musics_1 = require("./Musics");
Object.defineProperty(exports, "AppendOrUpdateMusicsToAlbum", { enumerable: true, get: function () { return Musics_1.AppendOrUpdateMusicsToAlbum; } });
const Tags_1 = require("../../Tags");
/** This function add a new music with tags coming from ID3 file.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @param {string} MusicFilePath
 */
const HandleNewMusicFromDisk = (tags, MusicFilePath) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (yield Musics_1.DoesMusicExistsTitle(tags.title))
        return;
    const diskImport = Tags_1.ConvertTagsFromDisk(tags, MusicFilePath);
    yield Musics_1.AddMusicToDatabase(diskImport.ImportedMusic, diskImport.ImportedAlbum, diskImport.ImportedArtist);
});
exports.HandleNewMusicFromDisk = HandleNewMusicFromDisk;
/** This function add a new music with tags coming from deezer API.
 * It will also check if the music exist already.
 * @param {object} tags - All tags about the music (see Tags.js for more details)
 * @returns {Promise<ObjectId>} Promise resolve by Music db id
 */
const HandleNewMusicFromDz = (tags) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (yield Musics_1.DoesMusicExistsTitleDzId(tags.title, tags.id)) {
        return;
    }
    /* eslint consistent-return: "off" */
    const deezerImport = Tags_1.ConvertTagsFromDz(tags, tags.id);
    return yield Musics_1.AddMusicToDatabase(deezerImport.ImportedMusic, deezerImport.ImportedAlbum, deezerImport.ImportedArtist, tags.artist.picture_big);
});
exports.HandleNewMusicFromDz = HandleNewMusicFromDz;
//# sourceMappingURL=index.js.map