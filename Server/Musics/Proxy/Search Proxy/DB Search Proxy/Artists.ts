import { Artist } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';
import { IArtist } from '../../../Interfaces';

const LogLocation = 'Musics.Proxy.Search.DBSearch.Artists';

// eslint-disable-next-line import/prefer-default-export
export const DBArtistSearch = (
	Query : string,
	Page = 0,
	PerPage = 8,
) : Promise<IArtist[]> => new Promise((resolve, reject) => {
	Artist
		.find({ $text: { $search: Query } })
		.limit(PerPage)
		.skip(Page * PerPage)
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
