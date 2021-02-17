import { IAlbum, IArtist } from 'lib/Models/Musics';
import { IDeezerAlbum, IDeezerExport } from 'lib/Types/Deezer';

export function GetTagsFromDeezerSearchAlbums(tags: IDeezerAlbum): IDeezerExport {
	const AlbumTags: IAlbum = ({
		Name: tags.title,
		DeezerId: tags.id,
		ImagePathDeezer: tags.cover_big,
	} as unknown) as IAlbum;

	const ArtistTags: IArtist = ({
		Name: tags.artist.name,
		DeezerId: tags.artist.id,
		ImagePath: tags.artist.picture_big,
	} as unknown) as IArtist;

	return {
		ImportedMusic: undefined,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}
