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
	const Result : IMusic[] = [];
	const U = await User.findById(MyUser._id).populate('LikedMusics').populate('ViewedMusics').exec();
	const FavoritesArtistsFromFav = await GetUserFavoriteArtistsFromFav(U);
	const FavoritesArtistsFromHistory = await GetUserFavoriteArtistsFromHistory(U);

	const MixedArtists = [...new Set(MixWithProportion({
		Arr: Object.keys(FavoritesArtistsFromFav),
		Percentage: 70,
	}, {
		Arr: Object.keys(FavoritesArtistsFromHistory),
		Percentage: 30,
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
		const TargetCount = Math.floor((Count / TotalArtistCount) * TargetLength);
		const MusicOfArtist = MusicsOfArtists.filter((m) => m.Artist === ArtistName);
		Result.push(..._.slice(_.orderBy(MusicOfArtist, ['Rank'], ['asc']), 0, TargetCount));
	}

	MopConsole.info(Location, `Got ${Result.length} for a user selection (target: ${TargetLength})`);
	return _.shuffle(Result);
};
