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
	SearchMusics: (q) => (UseMongoSearchIndex ? DBMusicSearch(q) : EsMusicSearch(q)),
	SearchAlbums: (q) => (UseMongoSearchIndex ? DBAlbumSearch(q) : EsAlbumSearch(q)),
	SearchArtists: (q) => (UseMongoSearchIndex ? DBArtistSearch(q) : EsArtistSearch(q)),
	SearchPlaylists: (q) => (UseMongoSearchIndex ? DBPlaylistSearch(q) : EsPlaylistSearch(q)),
	RefreshEsMusicIndex: () => (UseMongoSearchIndex ? () => {} : RefreshEsMusicIndex()),
};
