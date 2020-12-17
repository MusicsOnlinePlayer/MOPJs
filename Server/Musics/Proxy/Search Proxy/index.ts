import { UseMongoSearchIndex } from '../../../Config/MopConf.json';
import MopConsole from '../../../Tools/MopConsole';
import {
	IAlbum, IArtist, IMusic, IPlaylist,
} from '../../Interfaces';

import {
	DBMusicSearch, DBAlbumSearch, DBArtistSearch, DBPlaylistSearch,
} from './DB Search Proxy';

import {
	EsMusicSearch, EsAlbumSearch, EsArtistSearch, EsPlaylistSearch, RefreshEsMusicIndex,
} from './ES Proxy';

if (UseMongoSearchIndex) {
	MopConsole.warn('Musics.Proxy.SearchProxy', 'ElasticSearch requests are disabled, using mongodb text index instead');
}

export = {
	SearchMusics: (q : string, Page? : number, PerPage?: number) : Promise<IMusic[]> => (
		UseMongoSearchIndex
			? DBMusicSearch(q, Page, PerPage)
			: EsMusicSearch(q)),
	SearchAlbums: (q : string, Page? : number, PerPage?: number) : Promise<IAlbum[]> => (
		UseMongoSearchIndex
			? DBAlbumSearch(q, Page, PerPage)
			: EsAlbumSearch(q)),
	SearchArtists: (q : string, Page? : number, PerPage?: number) : Promise<IArtist[]> => (
		UseMongoSearchIndex
			? DBArtistSearch(q, Page, PerPage)
			: EsArtistSearch(q)),
	SearchPlaylists: (q : string, Page? : number, PerPage?: number) : Promise<IPlaylist[]> => (
		UseMongoSearchIndex
			? DBPlaylistSearch(q, Page, PerPage)
			: EsPlaylistSearch(q)),
	RefreshEsMusicIndex: () : Promise<void> => (
		UseMongoSearchIndex ? new Promise((r) => r()) : RefreshEsMusicIndex()
	),
};
