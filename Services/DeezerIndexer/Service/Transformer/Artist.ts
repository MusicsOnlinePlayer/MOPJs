import { IAlbum, IArtist } from 'lib/Models/Musics';
import { IDeezerAlbum, IDeezerArtist, IDeezerExport } from 'lib/Types/Deezer';

export function GetTagsFromDeezerSearchArtists(tags: IDeezerArtist): IDeezerExport {
	const ArtistTags: IArtist = ({
		Name: tags.name,
		DeezerId: tags.id,
		ImagePath: tags.picture_big,
	} as unknown) as IArtist;

	return {
		ImportedMusic: undefined,
		ImportedAlbum: undefined,
		ImportedArtist: ArtistTags,
	};
}

export function GetTagsFromDeezerArtistAlbums(tags: IDeezerAlbum): IDeezerExport {
	const AlbumsTags: IAlbum = ({
		Name: tags.title,
		DeezerId: tags.id,
		ImagePathDeezer: tags.cover_big,
	} as unknown) as IAlbum;

	return {
		ImportedMusic: undefined,
		ImportedAlbum: AlbumsTags,
		ImportedArtist: undefined,
	};
}
