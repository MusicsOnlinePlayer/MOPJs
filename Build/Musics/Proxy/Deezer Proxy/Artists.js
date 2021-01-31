"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetImageOfArtist = void 0;
const tslib_1 = require("tslib");
/* eslint-disable import/prefer-default-export */
const axios_1 = tslib_1.__importDefault(require("axios"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Misc_1 = require("./Misc");
const LogLocation = 'Musics.Proxy.DeezerProxy.Artist';
/** This function gets a file path (from Deezer API) of a specified artist image.
     * Correspond to 'picture_big'.
     * @param {number} ArtistDzId - The deezer Id of the artist
     * @returns {Promise<string>} File path from the Deezer API of the Artist Image
     */
const GetImageOfArtist = (ArtistDzId) => new Promise((resolve, reject) => {
    MopConsole_1.default.debug(LogLocation, `Begin requesting image of artist with Deezer id ${ArtistDzId}`);
    if (Misc_1.CheckIfDeezerReqAreAllowed())
        reject(new Error('Deezer requests not allowed'));
    axios_1.default.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
        .then(async (res) => {
        const dzRes = res.data;
        MopConsole_1.default.debug(LogLocation, `Found an image of artist with Deezer id ${ArtistDzId}`);
        resolve(dzRes.picture_big);
    })
        .catch((err) => {
        MopConsole_1.default.error('Artist.Deezer.API', err);
        reject();
    });
});
exports.GetImageOfArtist = GetImageOfArtist;
