"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EsAlbumSearch = void 0;
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.ESProxy.Albums';
// eslint-disable-next-line import/prefer-default-export
const EsAlbumSearch = (Query) => new Promise((resolve, reject) => {
    Model_1.Album.search({
        simple_query_string: {
            query: `${Query}*`,
            fields: [
                'Name^5',
            ],
            default_operator: 'and',
        },
    }, {
        size: 8,
    }, (err, result) => {
        if (err) {
            MopConsole_1.default.error(LogLocation, err.message);
        }
        const ClientResults = [];
        if (!result) {
            MopConsole_1.default.error(LogLocation, 'Request error !');
            reject(new Error('Request Error'));
            return;
        }
        result.hits.hits.map((hit) => {
            ClientResults.push(hit._id);
        });
        resolve(ClientResults);
    });
});
exports.EsAlbumSearch = EsAlbumSearch;
//# sourceMappingURL=Albums.js.map