import { IAlbum, Album } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.MusicSearch.Album';

export const DBAlbumSearch = (Query: string, Page = 0, PerPage = 8): Promise<IAlbum[]> =>
	new Promise((resolve, reject) => {
		Album.find({ $text: { $search: Query } })
			.limit(PerPage)
			.skip(Page * PerPage)
			.populate('MusicsId')
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
