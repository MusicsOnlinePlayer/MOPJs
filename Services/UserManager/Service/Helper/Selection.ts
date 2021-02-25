import { IMusic, isMusic, Music } from 'lib/Models/Musics';
import { IUser, User } from 'lib/Models/Users';
import MopConsole from 'lib/MopConsole';
import { sumBy, slice, countBy, shuffle, chunk, concat, uniqBy, flatten, sum, orderBy } from 'lodash';

const Location = 'Services.UserManager.Helper.Selection';

export const GetUserFavoriteArtistsFromFav = async (MyUser: IUser): Promise<Record<string, number>> => {
	const LikedMusics: string[] = MyUser.LikedMusics.map((m) => (isMusic(m) ? m.Artist : undefined)).filter(Boolean);
	return countBy(LikedMusics);
};

export const GetUserFavoriteArtistsFromHistory = async (MyUser: IUser): Promise<Record<string, number>> => {
	const history = [...new Set(MyUser.ViewedMusics)];
	const LikedMusics: string[] = history.map((m) => (isMusic(m) ? m.Artist : undefined)).filter(Boolean);
	return countBy(LikedMusics);
};

type MixEntry<T> = {
	Percentage: number;
	Arr: Array<T>;
};

export function MixWithProportion<T>(...entries: MixEntry<T>[]): Array<T> {
	const Result: Array<T> = [];
	const totalElements = sumBy(entries, (o) => o.Arr.length);
	const totalProp = sumBy(entries, (o) => o.Percentage);
	entries.forEach((entry) => {
		const Count = (entry.Percentage / totalProp) * totalElements;
		Result.push(...slice(shuffle(entry.Arr), 0, Count));
	});
	return Result;
}

export const GetSelectionForUser = async (MyUser: IUser, TargetLength: number): Promise<IMusic[]> => {
	const Params = {
		KnownMusicRatio: 0.5,
		NewMusicHist: 30,
		NewMusicFav: 70,
		KnownMusicHist: 30,
		KnownMusicFav: 70,
	};
	const Result: IMusic[] = [];
	const U = await User.findById(MyUser._id)
		.populate({
			path: 'LikedMusics',
			populate: [
				{
					path: 'AlbumId',
					model: 'Album',
				},
			],
		})
		.populate({
			path: 'ViewedMusics',
			populate: [
				{
					path: 'AlbumId',
					model: 'Album',
				},
			],
		})
		.exec();
	const FavoritesArtistsFromFav = await GetUserFavoriteArtistsFromFav(U);
	const FavoritesArtistsFromHistory = await GetUserFavoriteArtistsFromHistory(U);
	const Favorites: IMusic[] = U.LikedMusics.map((m) => (isMusic(m) ? m : undefined));
	const History: IMusic[] = U.ViewedMusics.map((m) => (isMusic(m) ? m : undefined));

	const MixedArtists = [
		...new Set(
			MixWithProportion(
				{
					Arr: Object.keys(FavoritesArtistsFromFav),
					Percentage: Params.NewMusicFav,
				},
				{
					Arr: Object.keys(FavoritesArtistsFromHistory),
					Percentage: Params.NewMusicHist,
				}
			)
		),
	];

	const FavoritesArtists: Record<string, number> = {};
	MixedArtists.forEach((e) => {
		FavoritesArtists[e] = (FavoritesArtistsFromFav[e] || 0) + (FavoritesArtistsFromHistory[e] || 0);
	});

	const TotalArtistCount = sum(Object.values(FavoritesArtists));
	MopConsole.debug(Location, `Total artist occurrences ${TotalArtistCount}`);
	const MusicsOfArtists = await Music.find({ Artist: { $in: Object.keys(FavoritesArtists) } })
		.populate('AlbumId')
		.exec();
	MopConsole.debug(Location, `Retrieved ${MusicsOfArtists.length} musics`);

	/* eslint guard-for-in: "off" */
	for (const [ArtistName, Count] of Object.entries(FavoritesArtists)) {
		const TargetCount = Math.floor((Count / TotalArtistCount) * TargetLength * (1 - Params.KnownMusicRatio));
		const MusicOfArtist = MusicsOfArtists.filter((m) => m.Artist === ArtistName);
		Result.push(...slice(orderBy(MusicOfArtist, ['Rank'], ['asc']), 0, TargetCount));
	}

	const ToFill = TargetLength - Result.length;
	const histChunkSize = Math.floor(History.length / 2);
	const historyChunks = chunk(History, histChunkSize);
	const favChunkSize = Math.floor(Favorites.length / 2);
	const favChunks = chunk(Favorites, favChunkSize);

	const SelectedHistoryChunks = historyChunks.filter((e, i) => Math.random() < i ** 2 / historyChunks.length);

	const SelectedFavChunks = favChunks.filter((e, i) => Math.random() < i ** 2 / historyChunks.length);

	const MixedFavHistory = MixWithProportion(
		{
			Arr: flatten(SelectedHistoryChunks),
			Percentage: Params.KnownMusicHist,
		},
		{
			Arr: flatten(SelectedFavChunks),
			Percentage: Params.KnownMusicFav,
		}
	);

	const sizedMixedFavHistory = slice(shuffle([...new Set(MixedFavHistory)]), 0, ToFill);
	const output = uniqBy(shuffle(concat(Result, ...sizedMixedFavHistory)), (e) => e._id.toString());
	MopConsole.info(Location, `Got ${output.length} for a user selection (target: ${TargetLength})`);
	MopConsole.debug(Location, `Params: KnownMusic: ${Params.KnownMusicRatio * 100}%`);
	MopConsole.debug(Location, `Favorites: Known ${Params.KnownMusicFav}% Unknown ${Params.NewMusicFav}%`);
	MopConsole.debug(Location, `History: Known ${Params.KnownMusicHist}% Unknown ${Params.NewMusicHist}%`);
	MopConsole.debug(
		Location,
		`Results: Known Favorites ${SelectedFavChunks.length * favChunkSize} History ${
			SelectedHistoryChunks.length * histChunkSize
		}`
	);
	MopConsole.debug(Location, `Chunk sizes: Favorites ${favChunkSize} History ${histChunkSize}`);
	return output;
};
