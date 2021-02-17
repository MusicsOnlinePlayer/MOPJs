import { IAlbum, IArtist } from 'lib/Models/Musics';
import { IDeezerAlbum, IDeezerExport } from 'lib/Types/Deezer';

export function GetTagsFromDeezerSearchAlbums(tags: IDeezerAlbum): IDeezerExport {
	const AlbumTags: IAlbum = ({
		Name: tags.title,
		DeezerId: tags.id,
	} as unknown) as IAlbum;

	const ArtistTags: IArtist = ({
		Name: tags.artist.name,
		DeezerId: tags.artist.id,
	} as unknown) as IArtist;

	return {
		ImportedMusic: undefined,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}
