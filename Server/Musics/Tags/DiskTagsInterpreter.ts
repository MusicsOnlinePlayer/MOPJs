import fs from 'fs';
import {
	IAlbum, IArtist, IDiskMusic, IMusic,
} from '../Interfaces';
import { IMusicImport } from './Types';

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
export function ConvertTags(tags: IDiskMusic, MusicFilePath: string) : IMusicImport {
	const { birthtime } = fs.statSync(MusicFilePath);
	const MusicTags : IMusic = ({
		Title: tags.title,
		Album: tags.album,
		Artist: tags.artist[0],
		PublishedDate: birthtime,
		TrackNumber: tags.track.no,
		FilePath: MusicFilePath,
		Views: 0,
		Likes: 0,
	} as unknown) as IMusic;

	const AlbumTags : IAlbum = ({
		Name: tags.album,
		Image: tags.picture[0] ? tags.picture[0].data.toString('base64') : '',
		ImageFormat: tags.picture[0] ? tags.picture[0].format : '',
	} as unknown) as IAlbum;

	const ArtistTags : IArtist = ({
		Name: tags.artist[0],
	} as unknown) as IArtist;

	return {
		ImportedMusic: MusicTags,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}
