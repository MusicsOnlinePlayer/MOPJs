/* eslint-disable import/prefer-default-export */
import Axios from 'axios';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.DeezerImporter.DeezerApi';

/** This function gets a file path (from Deezer API) of a specified artist image.
 * Correspond to 'picture_big'.
 * @param {number} ArtistDzId - The deezer Id of the artist
 * @returns {Promise<string>} File path from the Deezer API of the Artist Image
 */
export const GetDeezerArtistImage = (ArtistDzId: number): Promise<string> => new Promise(
    (resolve, reject) => {
        MopConsole.debug(LogLocation, `Getting artist image (id: ${ArtistDzId})`);
        Axios.get(`https://api.deezer.com/artist/${ArtistDzId}/`)
            .then(async (res) => {
                const dzRes = res.data;
                MopConsole.debug(LogLocation, `Got artist image (id: ${ArtistDzId})`);
                resolve(dzRes.picture_big);
            })
            .catch((err) => {
                MopConsole.error(LogLocation, err);
                reject(err);
            });
    },
);
