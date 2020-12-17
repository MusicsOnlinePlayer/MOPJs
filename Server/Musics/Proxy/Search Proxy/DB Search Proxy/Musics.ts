import { IMusic } from '../../../Interfaces';

import { Music } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';

const LogLocation = 'Musics.Proxy.Search.DBSearch.Musics';

// eslint-disable-next-line import/prefer-default-export
export const DBMusicSearch = (
	Query : string,
	Page = 0,
	PerPage = 8,
) : Promise<IMusic[]> => new Promise((resolve, reject) => {
	Music
		.find({ $text: { $search: Query } })
		.limit(PerPage)
		.skip(Page * PerPage)
		.populate('AlbumId')
		.exec(
			(err, result) => {
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
			},
		);
});
