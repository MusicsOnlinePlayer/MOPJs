import { IPlaylist } from '../../../Interfaces';

import { Playlist } from '../../../Model';
import MopConsole from '../../../../Tools/MopConsole';

const LogLocation = 'Musics.Proxy.Search.DBSearch.Playlists';

// eslint-disable-next-line import/prefer-default-export
export const DBPlaylistSearch = (
	Query : string,
	Page = 0,
	PerPage = 8,
) : Promise<IPlaylist[]> => new Promise((resolve, reject) => {
	Playlist
		.find({ $text: { $search: Query }, IsPublic: true })
		.limit(PerPage)
		.skip(Page * PerPage)
		.populate({
			path: 'MusicsId',
			populate: {
				path: 'AlbumId',
				model: 'Album',
			},
		})
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
