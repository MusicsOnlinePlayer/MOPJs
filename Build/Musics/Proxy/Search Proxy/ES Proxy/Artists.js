"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Model_1 = require("../../../Model");
const MopConsole_1 = tslib_1.__importDefault(require("../../../../Tools/MopConsole"));
const LogLocation = 'Musics.Proxy.Search.ESProxy.Artists';
// eslint-disable-next-line import/prefer-default-export
exports.EsArtistSearch = (Query) => new Promise((resolve, reject) => {
    Model_1.Artist.search({
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
