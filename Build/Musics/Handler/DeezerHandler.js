"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportTrendingMusics = exports.SearchMusics = exports.CompleteArtist = exports.CompleteAlbum = void 0;
const tslib_1 = require("tslib");
const DB_Proxy_1 = require("../Proxy/DB Proxy");
const Musics_1 = require("../Proxy/Deezer Proxy/Musics");
const Deezer_Proxy_1 = require("../Proxy/Deezer Proxy");
Object.defineProperty(exports, "SearchMusics", { enumerable: true, get: function () { return Deezer_Proxy_1.SearchMusics; } });
const Tags_1 = require("../Tags");
const MopConsole_1 = tslib_1.__importDefault(require("../../Tools/MopConsole"));
const Trending_1 = require("../Proxy/Deezer Proxy/Trending");
const Musics_2 = require("../Proxy/DB Proxy/Musics");
const Model_1 = require("../Model");
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
async function ImportTrendingMusics() {
    const DzMusics = await Trending_1.GetTrendingMusics();
    const DzMusicsFormatted = DzMusics.map((DzMusic) => Tags_1.ConvertTagsFromDz(DzMusic, DzMusic.id));
    const DzIds = DzMusicsFormatted.map((e) => e.ImportedMusic.DeezerId);
    const ExistingMusics = await Model_1.Music.find({
        DeezerId: { $in: DzIds },
    });
    const TrendingMusics = [];
    for (const m of DzMusicsFormatted) {
        const MatchedMusic = ExistingMusics.find((o) => o.DeezerId === m.ImportedMusic.DeezerId);
        if (MatchedMusic) {
            TrendingMusics.push(MatchedMusic._id);
        }
        else {
            TrendingMusics.push(await Musics_2.AddMusicToDatabase(m.ImportedMusic, m.ImportedAlbum, m.ImportedArtist));
        }
    }
    return await Model_1.Music.find({ _id: { $in: TrendingMusics } }).populate('AlbumId').exec();
}
exports.ImportTrendingMusics = ImportTrendingMusics;
async function CompleteArtist(ArtistDoc) {
    const DzAlbums = await Deezer_Proxy_1.GetAlbumsOfArtist(ArtistDoc.DeezerId);
    await DB_Proxy_1.HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
}
exports.CompleteArtist = CompleteArtist;
