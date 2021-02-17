import { IArtist } from 'lib/Models/Musics';
import { IDeezerArtist, IDeezerExport } from 'lib/Types/Deezer';

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
