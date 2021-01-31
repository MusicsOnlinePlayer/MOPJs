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
    const Result = [];
    const U = await Model_1.User.findById(MyUser._id).populate('LikedMusics').populate('ViewedMusics').exec();
    const FavoritesArtistsFromFav = await exports.GetUserFavoriteArtistsFromFav(U);
    const FavoritesArtistsFromHistory = await exports.GetUserFavoriteArtistsFromHistory(U);
    const MixedArtists = [...new Set(MixWithProportion({
            Arr: Object.keys(FavoritesArtistsFromFav),
            Percentage: 70,
        }, {
            Arr: Object.keys(FavoritesArtistsFromHistory),
            Percentage: 30,
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
        const TargetCount = Math.floor((Count / TotalArtistCount) * TargetLength);
        const MusicOfArtist = MusicsOfArtists.filter((m) => m.Artist === ArtistName);
        Result.push(...lodash_1.default.slice(lodash_1.default.orderBy(MusicOfArtist, ['Rank'], ['asc']), 0, TargetCount));
    }
    MopConsole_1.default.info(Location, `Got ${Result.length} for a user selection (target: ${TargetLength})`);
    return lodash_1.default.shuffle(Result);
};
exports.GetSelectionForUser = GetSelectionForUser;
