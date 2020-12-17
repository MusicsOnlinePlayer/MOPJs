"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMusics = exports.CompleteArtist = exports.CompleteAlbum = void 0;
const tslib_1 = require("tslib");
const DB_Proxy_1 = require("../Proxy/DB Proxy");
const Musics_1 = require("../Proxy/Deezer Proxy/Musics");
const Deezer_Proxy_1 = require("../Proxy/Deezer Proxy");
Object.defineProperty(exports, "SearchMusics", { enumerable: true, get: function () { return Deezer_Proxy_1.SearchMusics; } });
const Tags_1 = require("../Tags");
function CompleteAlbum(AlbumDoc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const DzMusics = yield Musics_1.GetMusicOfAlbum(AlbumDoc.DeezerId);
        const DzMusicsFormatted = DzMusics.map((DzMusic) => Tags_1.ConvertTagsFromDzAlbum(DzMusic, AlbumDoc.Name, AlbumDoc.DeezerId).ImportedMusic);
        yield DB_Proxy_1.AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);
        yield DB_Proxy_1.UpdateAlbumCompleteStatus(AlbumDoc.DeezerId);
    });
}
exports.CompleteAlbum = CompleteAlbum;
function CompleteArtist(ArtistDoc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const DzAlbums = yield Deezer_Proxy_1.GetAlbumsOfArtist(ArtistDoc.DeezerId);
        yield DB_Proxy_1.HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
    });
}
exports.CompleteArtist = CompleteArtist;
//# sourceMappingURL=DeezerHandler.js.map