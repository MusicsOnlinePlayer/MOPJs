"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshEsMusicIndex = exports.EsMusicSearch = void 0;
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.ESProxy.Musics';
const EsMusicSearch = (Query) => new Promise((resolve, reject) => {
    // TODO Populate query.
    Model_1.Music.search({
        function_score: {
            query: {
                simple_query_string: {
                    query: `${Query}*`,
                    fields: [
                        'Title^5',
                        'Album^2',
                        'Artist^2',
                    ],
                    default_operator: 'and',
                },
            },
            field_value_factor: {
                field: 'Views',
                factor: 2,
                modifier: 'sqrt',
                missing: 1,
            },
        },
    }, {
        size: 8,
    }, (err, result) => {
        if (err) {
            MopConsole_1.default.error(LogLocation, err.message);
            return;
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
exports.EsMusicSearch = EsMusicSearch;
/** Use this function to force refresh indices on es
 * Use it after adding data to es so that search results are up to date.
 */
const RefreshEsMusicIndex = () => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, 'Refreshing es music index');
    Model_1.esClient.indices.refresh({ index: 'musics' }, (err) => {
        if (err) {
            reject(err);
            return;
        }
        resolve();
    });
    MopConsole_1.default.debug(LogLocation, 'music index refreshed');
});
exports.RefreshEsMusicIndex = RefreshEsMusicIndex;
