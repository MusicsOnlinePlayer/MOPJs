"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchMusics = exports.CompleteArtist = exports.CompleteAlbum = void 0;
const tslib_1 = require("tslib");
const DB_Proxy_1 = require("../Proxy/DB Proxy");
const Musics_1 = require("../Proxy/Deezer Proxy/Musics");
const Deezer_Proxy_1 = require("../Proxy/Deezer Proxy");
Object.defineProperty(exports, "SearchMusics", { enumerable: true, get: function () { return Deezer_Proxy_1.SearchMusics; } });
const Tags_1 = require("../Tags");
const MopConsole_1 = tslib_1.__importDefault(require("../../Tools/MopConsole"));
const Location = 'Musics.Handler.DeezerHandler';
async function CompleteAlbum(AlbumDoc) {
    const DzMusics = await Musics_1.GetMusicOfAlbum(AlbumDoc.DeezerId);
    const DzMusicsFormatted = DzMusics.map((DzMusic) => Tags_1.ConvertTagsFromDzAlbum(DzMusic, AlbumDoc.Name, AlbumDoc.DeezerId).ImportedMusic);
    await DB_Proxy_1.AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);
    const numberModified = await DB_Proxy_1.UpdateRanksBulk(DzMusics);
    MopConsole_1.default.info(Location, `Updated ranks of ${numberModified} musics`);
    await DB_Proxy_1.UpdateAlbumCompleteStatus(AlbumDoc.DeezerId);
}
exports.CompleteAlbum = CompleteAlbum;
async function CompleteArtist(ArtistDoc) {
    const DzAlbums = await Deezer_Proxy_1.GetAlbumsOfArtist(ArtistDoc.DeezerId);
    await DB_Proxy_1.HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
}
exports.CompleteArtist = CompleteArtist;
