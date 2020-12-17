"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
/** This function normalizes ID3 tags
 * @param {object} tags - ID3 tags
 * @param {string} tags.title - Name of the Music
 * @param {string} tags.album - Name of the album
 * @param {[string]} tags.artist - Artists of the Music
 * @param {object} tags.track - Details about the song
 * @param {number} tags.track.no - Track Position in the Album
 * @param {[object]} tags.picture - Covers of the song
 *
 * @param {string} MusicFilePath - Path of the music
 */
// eslint-disable-next-line import/prefer-default-export
function ConvertTags(tags, MusicFilePath) {
    const { birthtime } = fs_1.default.statSync(MusicFilePath);
    const MusicTags = {
        Title: tags.title,
        Album: tags.album,
        Artist: tags.artist[0],
        PublishedDate: birthtime,
        TrackNumber: tags.track.no,
        FilePath: MusicFilePath,
        Views: 0,
        Likes: 0,
    };
    const AlbumTags = {
        Name: tags.album,
        Image: tags.picture[0] ? tags.picture[0].data.toString('base64') : '',
        ImageFormat: tags.picture[0] ? tags.picture[0].format : '',
    };
    const ArtistTags = {
        Name: tags.artist[0],
    };
    return {
        ImportedMusic: MusicTags,
        ImportedAlbum: AlbumTags,
        ImportedArtist: ArtistTags,
    };
}
exports.ConvertTags = ConvertTags;
