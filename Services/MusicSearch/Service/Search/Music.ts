import { IMusic, Music } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.MusicSearch.Music';

export const DBMusicSearch = (Query: string, Page = 0, PerPage = 8): Promise<IMusic[]> =>
	new Promise((resolve, reject) => {
		Music.find({ $text: { $search: Query } }, { score: { $meta: 'textScore' } })
			.sort({ score: { $meta: 'textScore' }, Rank: -1 })
			.limit(PerPage)
			.skip(Page * PerPage)
			.populate('AlbumId')
			.exec((err: Error, result: IMusic[]) => {
				if (err) {
					MopConsole.error(LogLocation, err.message);
					return;
				}

				if (!result) {
					MopConsole.error(LogLocation, 'Request error !');
					reject(new Error('Request Error'));
					return;
				}

				resolve(result);
			});
	});
