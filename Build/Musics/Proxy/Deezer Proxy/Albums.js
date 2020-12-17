"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Albums';
/** This function gets all albums of a specified Artist (here by a deezer id)
 * @param {number} ArtistDzId - The deezer Id of the artist
 * @returns {Promise<Array<IDeezerAlbum>>}Data from deezer API, not formatted for a usage in MongoDB
 */
exports.GetAlbumsOfArtist = (ArtistDzId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Begin request of albums from artist with Deezer id ${ArtistDzId}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve([]);
    axios_1.default.get(`https://api.deezer.com/artist/${ArtistDzId}/albums`)
        .then((res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MusicsOfAlbums = [];
        MusicsOfAlbums.push(...res.data.data);
        MopConsole_1.default.debug(LogLocation, `Received ${MusicsOfAlbums.length} albums for artist with Deezer id ${ArtistDzId}`);
        let nextUrl = res.data.next;
        while (nextUrl) {
            let nextRes;
            try {
                nextRes = yield axios_1.default.get(nextUrl);
                MusicsOfAlbums.push(...nextRes.data.data);
            }
            catch (handlerErr) {
                MopConsole_1.default.error(LogLocation, handlerErr);
            }
            nextUrl = nextRes.data ? nextRes.data.next : undefined;
        }
        MopConsole_1.default.debug(LogLocation, `Received a total of ${MusicsOfAlbums.length} albums for artist with Deezer id ${ArtistDzId}`);
        resolve(MusicsOfAlbums);
    }))
        .catch((err) => {
        MopConsole_1.default.error(LogLocation, err);
        reject();
    });
});
/** This function gets a file path (from Deezer API) of a specified album cover.
 * Correspond to 'cover_big'.
 * @param {number} AlbumDzId - The deezer Id of the album
 * @returns {string} File path from the Deezer API of the cover
 */
exports.GetCoverPathOfAlbum = (AlbumDzId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Begin requesting cover of album with Deezer id ${AlbumDzId}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        resolve('');
    axios_1.default.get(`https://api.deezer.com/album/${AlbumDzId}`)
        .then((res) => {
        const dzRes = res.data;
        MopConsole_1.default.debug(LogLocation, `Found a cover of album with Deezer id ${AlbumDzId}`);
        resolve(dzRes.cover_big);
    })
        .catch((err) => {
        MopConsole_1.default.error('Album.Deezer.API', err);
        reject();
    });
});
