const { UseMongoSearchIndex } = require('../../../Config/MopConf.json');
const MopConsole = require('../../../Tools/MopConsole');

if (UseMongoSearchIndex) {
	MopConsole.warn('Musics.Proxy.SearchProxy', 'ElasticSearch requests are disabled, using mongodb text index instead');
}

const {
	DBMusicSearch, DBAlbumSearch, DBArtistSearch, DBPlaylistSearch,
} = require('./DB Search Proxy');

const {
	EsMusicSearch, EsAlbumSearch, EsArtistSearch, EsPlaylistSearch, RefreshEsMusicIndex,
} = require('./ES Proxy');

module.exports = {
	SearchMusics: (q, Page, PerPage) => (UseMongoSearchIndex
		? DBMusicSearch(q, Page, PerPage)
		: EsMusicSearch(q)),
	SearchAlbums: (q, Page, PerPage) => (UseMongoSearchIndex
		? DBAlbumSearch(q, Page, PerPage)
		: EsAlbumSearch(q)),
	SearchArtists: (q, Page, PerPage) => (UseMongoSearchIndex
		? DBArtistSearch(q, Page, PerPage)
		: EsArtistSearch(q)),
	SearchPlaylists: (q, Page, PerPage) => (UseMongoSearchIndex
		? DBPlaylistSearch(q, Page, PerPage)
		: EsPlaylistSearch(q)),
	RefreshEsMusicIndex: () => (UseMongoSearchIndex ? () => {} : RefreshEsMusicIndex()),
};
