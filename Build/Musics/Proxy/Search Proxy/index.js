"use strict";
const tslib_1 = require("tslib");
const MopConf_json_1 = require("../../../Config/MopConf.json");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const DB_Search_Proxy_1 = require("./DB Search Proxy");
const ES_Proxy_1 = require("./ES Proxy");
if (MopConf_json_1.UseMongoSearchIndex) {
    MopConsole_1.default.warn('Musics.Proxy.SearchProxy', 'ElasticSearch requests are disabled, using mongodb text index instead');
}
module.exports = {
    SearchMusics: (q, Page, PerPage) => (MopConf_json_1.UseMongoSearchIndex
        ? DB_Search_Proxy_1.DBMusicSearch(q, Page, PerPage)
        : ES_Proxy_1.EsMusicSearch(q)),
    SearchAlbums: (q, Page, PerPage) => (MopConf_json_1.UseMongoSearchIndex
        ? DB_Search_Proxy_1.DBAlbumSearch(q, Page, PerPage)
        : ES_Proxy_1.EsAlbumSearch(q)),
    SearchArtists: (q, Page, PerPage) => (MopConf_json_1.UseMongoSearchIndex
        ? DB_Search_Proxy_1.DBArtistSearch(q, Page, PerPage)
        : ES_Proxy_1.EsArtistSearch(q)),
    SearchPlaylists: (q, Page, PerPage) => (MopConf_json_1.UseMongoSearchIndex
        ? DB_Search_Proxy_1.DBPlaylistSearch(q, Page, PerPage)
        : ES_Proxy_1.EsPlaylistSearch(q)),
    RefreshEsMusicIndex: () => (MopConf_json_1.UseMongoSearchIndex ? new Promise((r) => r()) : ES_Proxy_1.RefreshEsMusicIndex()),
};
//# sourceMappingURL=index.js.map