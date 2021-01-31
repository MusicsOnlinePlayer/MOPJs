import {
	IAlbum, IArtist, IDeezerMusic, IMusic,
} from '../Interfaces';

import MopConsole from '../../Tools/MopConsole';
import { IMusicImport } from './Types';

/** This function normalize tags coming from Deezer
 * @param {object} tags - Tags coming from Deezer
 * @param {string} tags.title - Music title
 * @param {object} tags.album - Album details
 * @param {string} tags.album.title - Album Title
 * @param {number} tags.album.id - Deezer Id of Album
 * @param {string} tags.album.cover_big - Album Cover Path
 * @param {object} tags.artist - Artist details
 * @param {string} tags.artist.name - Artist Name
 * @param {number} tags.artist.id - Deezer Id of Artist
 * @param {number} tags.track_position - Position of music in album
 *
 * @param {number} DeezerId - Deezer id of the music
 * @param {string=} CustomAlbumName - Override Album name contained in tags
 * @param {number=} CustomAlbumDzId - Override Deezer Id of album contained in tags
 * @param {string=} CustomCoverPath - Override Cover Path of album contained in tags
 *
 * @return {object} Normalize tags, ready to be saved in MongoDB
 * */
export function ConvertTags(
	tags : IDeezerMusic,
	DeezerId : number,
	CustomAlbumName: string = undefined,
	CustomAlbumDzId: number = undefined,
	CustomCoverPath: string = undefined,
) : IMusicImport {
	if (!tags.album) {
		MopConsole.warn('Music.Handler.Tags.Deezer', `Found empty album for track ${tags.title} - Deezer id ${DeezerId}`);
		if (!CustomCoverPath) {
			MopConsole.warn('Music.Handler.Tags.Deezer', 'And no custom cover path provided');
		}
		MopConsole.warn('Music.Handler.Tags.Deezer', `Additional args provided - CustomAlbumName: ${CustomAlbumName} CustomAlbumDzId: ${CustomAlbumDzId} CustomCoverPath: ${CustomCoverPath}`);
	}

	const MusicTags : IMusic = ({
		Title: tags.title,
		Album: CustomAlbumName || tags.album.title,
		Artist: tags.artist.name,
		PublishedDate: new Date(),
		TrackNumber: tags.track_position || 0,
		DeezerId,
		Views: 0,
		Likes: 0,
		Rank: tags.rank,
	} as unknown) as IMusic;
	const AlbumTags : IAlbum = ({
		Name: CustomAlbumName || tags.album.title,
		DeezerId: CustomAlbumDzId || tags.album.id,
		ImagePathDeezer: CustomCoverPath || tags.album.cover_big,
	} as unknown) as IAlbum;
	const ArtistTags : IArtist = ({
		Name: tags.artist.name,
		DeezerId: tags.artist.id,
	} as unknown) as IArtist;

	return {
		ImportedMusic: MusicTags,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}

export function ConvertTagsFromDzAlbum(
	tags: IDeezerMusic,
	AlbumName: string,
	AlbumDzId : number,
): IMusicImport {
	const MusicTags : IMusic = ({
		Title: tags.title,
		Album: AlbumName,
		Artist: tags.artist.name,
		PublishedDate: new Date(),
		TrackNumber: tags.track_position || 0,
		DeezerId: tags.id,
		Views: 0,
		Likes: 0,
		Rank: tags.rank,
	} as unknown) as IMusic;

	const AlbumTags : IAlbum = ({
		Name: AlbumName,
		DeezerId: AlbumDzId,
	} as unknown) as IAlbum;

	const ArtistTags : IArtist = ({
		Name: tags.artist.name,
		DeezerId: tags.artist.id,
	} as unknown) as IArtist;

	return {
		ImportedMusic: MusicTags,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}
