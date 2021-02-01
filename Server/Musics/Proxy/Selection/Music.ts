import _ from 'lodash';
import MopConsole from '../../../Tools/MopConsole';
import { User } from '../../../Users/Model';
import { IUser } from '../../../Users/Model/Interfaces';
import { isMusic, IMusic } from '../../Interfaces';
import { Music } from '../../Model';

const Location = 'Musics.Proxy.Selection';

export const GetUserFavoriteArtistsFromFav = async (
	MyUser: IUser,
) : Promise<Record<string, number>> => {
	const LikedMusics : string[] = MyUser.LikedMusics
		.map((m) => (isMusic(m) ? m.Artist : undefined))
		.filter(Boolean);
	return _.countBy(LikedMusics);
};

export const GetUserFavoriteArtistsFromHistory = async (
	MyUser: IUser,
) : Promise<Record<string, number>> => {
	const history = [...new Set(MyUser.ViewedMusics)];
	const LikedMusics : string[] = history
		.map((m) => (isMusic(m) ? m.Artist : undefined))
		.filter(Boolean);
	return _.countBy(LikedMusics);
};

type MixEntry<T> = {
	Percentage: number,
	Arr: Array<T>
};

export function MixWithProportion<T>(...entries: MixEntry<T>[]) : Array<T> {
	const Result: Array<T> = [];
	const totalElements = _.sumBy(entries, (o) => o.Arr.length);
	const totalProp = _.sumBy(entries, (o) => o.Percentage);
	entries.forEach((entry) => {
		const Count = (entry.Percentage / totalProp) * totalElements;
		Result.push(..._.slice(_.shuffle(entry.Arr), 0, Count));
	});
	return Result;
}

export const GetSelectionForUser = async (
	MyUser: IUser,
	TargetLength: number,
) : Promise<IMusic[]> => {
	const Params = {
		KnownMusicRatio: 0.5,
		NewMusicHist: 30,
		NewMusicFav: 70,
		KnownMusicHist: 30,
		KnownMusicFav: 70,
	};
	const Result : IMusic[] = [];
	const U = await User.findById(MyUser._id).populate({
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
	const FavoritesArtistsFromFav = await GetUserFavoriteArtistsFromFav(U);
	const FavoritesArtistsFromHistory = await GetUserFavoriteArtistsFromHistory(U);
	const Favorites : IMusic[] = U.LikedMusics.map((m) => (isMusic(m) ? m : undefined));
	const History : IMusic[] = U.ViewedMusics.map((m) => (isMusic(m) ? m : undefined));

	const MixedArtists = [...new Set(MixWithProportion({
		Arr: Object.keys(FavoritesArtistsFromFav),
		Percentage: Params.NewMusicFav,
	}, {
		Arr: Object.keys(FavoritesArtistsFromHistory),
		Percentage: Params.NewMusicHist,
	}))];

	const FavoritesArtists : Record<string, number> = {};
	MixedArtists.forEach((e) => {
		FavoritesArtists[e] = (FavoritesArtistsFromFav[e] || 0) + (FavoritesArtistsFromHistory[e] || 0);
	});

	const TotalArtistCount = _.sum(Object.values(FavoritesArtists));
	MopConsole.debug(Location, `Total artist occurrences ${TotalArtistCount}`);
	const MusicsOfArtists = await Music
		.find({ Artist: { $in: Object.keys(FavoritesArtists) } })
		.populate('AlbumId')
		.exec();
	MopConsole.debug(Location, `Retrieved ${MusicsOfArtists.length} musics`);

	/* eslint guard-for-in: "off" */
	for (const [ArtistName, Count] of Object.entries(FavoritesArtists)) {
		const TargetCount = Math.floor((Count / TotalArtistCount) * TargetLength * (1 - Params.KnownMusicRatio));
		const MusicOfArtist = MusicsOfArtists.filter((m) => m.Artist === ArtistName);
		Result.push(..._.slice(_.orderBy(MusicOfArtist, ['Rank'], ['asc']), 0, TargetCount));
	}

	const ToFill = TargetLength - Result.length;
	const histChunkSize = Math.floor(History.length / 2);
	const historyChunks = _.chunk(History, histChunkSize);
	const favChunkSize = Math.floor(Favorites.length / 2);
	const favChunks = _.chunk(Favorites, favChunkSize);

	const SelectedHistoryChunks = historyChunks.filter(
		(e, i) => Math.random() < ((i ** 2) / historyChunks.length),
	);

	const SelectedFavChunks = favChunks.filter(
		(e, i) => Math.random() < ((i ** 2) / historyChunks.length),
	);

	const MixedFavHistory = MixWithProportion({
		Arr: _.flatten(SelectedHistoryChunks),
		Percentage: Params.KnownMusicHist,
	}, {
		Arr: _.flatten(SelectedFavChunks),
		Percentage: Params.KnownMusicFav,
	});

	const sizedMixedFavHistory = _.slice(_.shuffle([...new Set(MixedFavHistory)]), 0, ToFill);
	const output = _.uniqBy(_.shuffle(_.concat(Result, ...sizedMixedFavHistory)), (e) => e._id.toString());
	MopConsole.info(Location, `Got ${output.length} for a user selection (target: ${TargetLength})`);
	MopConsole.debug(Location, `Params: KnownMusic: ${Params.KnownMusicRatio * 100}%`);
	MopConsole.debug(Location, `Favorites: Known ${Params.KnownMusicFav}% Unknown ${Params.NewMusicFav}%`);
	MopConsole.debug(Location, `History: Known ${Params.KnownMusicHist}% Unknown ${Params.NewMusicHist}%`);
	MopConsole.debug(Location, `Results: Known Favorites ${SelectedFavChunks.length * favChunkSize} History ${SelectedHistoryChunks.length * histChunkSize}`);
	MopConsole.debug(Location, `Chunk sizes: Favorites ${favChunkSize} History ${histChunkSize}`);
	return output;
};
