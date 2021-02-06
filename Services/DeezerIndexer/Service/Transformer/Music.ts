import { IAlbum, IArtist, IMusic } from 'lib/Models/Musics';
import { IDeezerMusic } from 'lib/Types/Deezer';
import { IDeezerExport } from 'lib/Types/Deezer/IDeezerExport';

export function GetTagsFromDeezerAlbumMusics(tags: IDeezerMusic, AlbumName: string, AlbumDzId: number): IDeezerExport {
	const MusicTags: IMusic = ({
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

	const AlbumTags: IAlbum = ({
		Name: AlbumName,
		DeezerId: AlbumDzId,
	} as unknown) as IAlbum;

	const ArtistTags: IArtist = ({
		Name: tags.artist.name,
		DeezerId: tags.artist.id,
	} as unknown) as IArtist;

	return {
		ImportedMusic: MusicTags,
		ImportedAlbum: AlbumTags,
		ImportedArtist: ArtistTags,
	};
}
