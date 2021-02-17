import { Artist, IArtist } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.MusicSearch.Album';

export const DBArtistSearch = (Query: string, Page = 0, PerPage = 8): Promise<IArtist[]> =>
	new Promise((resolve, reject) => {
		Artist.find({ $text: { $search: Query } })
			.limit(PerPage)
			.skip(Page * PerPage)
			.exec((err, result) => {
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
