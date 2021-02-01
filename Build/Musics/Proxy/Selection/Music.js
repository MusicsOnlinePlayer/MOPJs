"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetSelectionForUser = exports.MixWithProportion = exports.GetUserFavoriteArtistsFromHistory = exports.GetUserFavoriteArtistsFromFav = void 0;
const tslib_1 = require("tslib");
const lodash_1 = tslib_1.__importDefault(require("lodash"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Model_1 = require("../../../Users/Model");
const Interfaces_1 = require("../../Interfaces");
const Model_2 = require("../../Model");
const Location = 'Musics.Proxy.Selection';
const GetUserFavoriteArtistsFromFav = async (MyUser) => {
    const LikedMusics = MyUser.LikedMusics
        .map((m) => (Interfaces_1.isMusic(m) ? m.Artist : undefined))
        .filter(Boolean);
    return lodash_1.default.countBy(LikedMusics);
};
exports.GetUserFavoriteArtistsFromFav = GetUserFavoriteArtistsFromFav;
const GetUserFavoriteArtistsFromHistory = async (MyUser) => {
    const history = [...new Set(MyUser.ViewedMusics)];
    const LikedMusics = history
        .map((m) => (Interfaces_1.isMusic(m) ? m.Artist : undefined))
        .filter(Boolean);
    return lodash_1.default.countBy(LikedMusics);
};
exports.GetUserFavoriteArtistsFromHistory = GetUserFavoriteArtistsFromHistory;
function MixWithProportion(...entries) {
    const Result = [];
    const totalElements = lodash_1.default.sumBy(entries, (o) => o.Arr.length);
    const totalProp = lodash_1.default.sumBy(entries, (o) => o.Percentage);
    entries.forEach((entry) => {
        const Count = (entry.Percentage / totalProp) * totalElements;
        Result.push(...lodash_1.default.slice(lodash_1.default.shuffle(entry.Arr), 0, Count));
    });
    return Result;
}
exports.MixWithProportion = MixWithProportion;
const GetSelectionForUser = async (MyUser, TargetLength) => {
    const Params = {
        KnownMusicRatio: 0.5,
        NewMusicHist: 30,
        NewMusicFav: 70,
        KnownMusicHist: 30,
        KnownMusicFav: 70,
    };
    const Result = [];
    const U = await Model_1.User.findById(MyUser._id).populate({
        path: 'LikedMusics',
        populate: [{
                path: 'AlbumId',
                model: 'Album',
            }],
    }).populate({
        path: 'ViewedMusics',
        populate: [{
                path: 'AlbumId',
                model: 'Album',
            }],
    }).exec();
    const FavoritesArtistsFromFav = await exports.GetUserFavoriteArtistsFromFav(U);
    const FavoritesArtistsFromHistory = await exports.GetUserFavoriteArtistsFromHistory(U);
    const Favorites = U.LikedMusics.map((m) => (Interfaces_1.isMusic(m) ? m : undefined));
    const History = U.ViewedMusics.map((m) => (Interfaces_1.isMusic(m) ? m : undefined));
    const MixedArtists = [...new Set(MixWithProportion({
            Arr: Object.keys(FavoritesArtistsFromFav),
            Percentage: Params.NewMusicFav,
        }, {
            Arr: Object.keys(FavoritesArtistsFromHistory),
            Percentage: Params.NewMusicHist,
        }))];
    const FavoritesArtists = {};
    MixedArtists.forEach((e) => {
        FavoritesArtists[e] = (FavoritesArtistsFromFav[e] || 0) + (FavoritesArtistsFromHistory[e] || 0);
    });
    const TotalArtistCount = lodash_1.default.sum(Object.values(FavoritesArtists));
    MopConsole_1.default.debug(Location, `Total artist occurrences ${TotalArtistCount}`);
    const MusicsOfArtists = await Model_2.Music
        .find({ Artist: { $in: Object.keys(FavoritesArtists) } })
        .populate('AlbumId')
        .exec();
    MopConsole_1.default.debug(Location, `Retrieved ${MusicsOfArtists.length} musics`);
    /* eslint guard-for-in: "off" */
    for (const [ArtistName, Count] of Object.entries(FavoritesArtists)) {
        const TargetCount = Math.floor((Count / TotalArtistCount) * TargetLength * (1 - Params.KnownMusicRatio));
        const MusicOfArtist = MusicsOfArtists.filter((m) => m.Artist === ArtistName);
        Result.push(...lodash_1.default.slice(lodash_1.default.orderBy(MusicOfArtist, ['Rank'], ['asc']), 0, TargetCount));
    }
    const ToFill = TargetLength - Result.length;
    const histChunkSize = Math.floor(History.length / 2);
    const historyChunks = lodash_1.default.chunk(History, histChunkSize);
    const favChunkSize = Math.floor(Favorites.length / 2);
    const favChunks = lodash_1.default.chunk(Favorites, favChunkSize);
    const SelectedHistoryChunks = historyChunks.filter((e, i) => Math.random() < ((i ** 2) / historyChunks.length));
    const SelectedFavChunks = favChunks.filter((e, i) => Math.random() < ((i ** 2) / historyChunks.length));
    const MixedFavHistory = MixWithProportion({
        Arr: lodash_1.default.flatten(SelectedHistoryChunks),
        Percentage: Params.KnownMusicHist,
    }, {
        Arr: lodash_1.default.flatten(SelectedFavChunks),
        Percentage: Params.KnownMusicFav,
    });
    const sizedMixedFavHistory = lodash_1.default.slice(lodash_1.default.shuffle([...new Set(MixedFavHistory)]), 0, ToFill);
    const output = lodash_1.default.uniqBy(lodash_1.default.shuffle(lodash_1.default.concat(Result, ...sizedMixedFavHistory)), (e) => e._id.toString());
    MopConsole_1.default.info(Location, `Got ${output.length} for a user selection (target: ${TargetLength})`);
    MopConsole_1.default.debug(Location, `Params: KnownMusic: ${Params.KnownMusicRatio * 100}%`);
    MopConsole_1.default.debug(Location, `Favorites: Known ${Params.KnownMusicFav}% Unknown ${Params.NewMusicFav}%`);
    MopConsole_1.default.debug(Location, `History: Known ${Params.KnownMusicHist}% Unknown ${Params.NewMusicHist}%`);
    MopConsole_1.default.debug(Location, `Results: Known Favorites ${SelectedFavChunks.length * favChunkSize} History ${SelectedHistoryChunks.length * histChunkSize}`);
    MopConsole_1.default.debug(Location, `Chunk sizes: Favorites ${favChunkSize} History ${histChunkSize}`);
    return output;
};
exports.GetSelectionForUser = GetSelectionForUser;
