import { AppendOrUpdateMusicsToAlbum, HandleAlbumsFromDz, UpdateAlbumCompleteStatus } from '../Proxy/DB Proxy';
import { GetMusicOfAlbum as GetMusicsOfAlbum } from '../Proxy/Deezer Proxy/Musics';
import { GetAlbumsOfArtist, SearchMusics } from '../Proxy/Deezer Proxy';
import { ConvertTagsFromDzAlbum } from '../Tags';
import { IAlbum, IArtist } from '../Interfaces';

async function CompleteAlbum(AlbumDoc: IAlbum) : Promise<void> {
	const DzMusics = await GetMusicsOfAlbum(AlbumDoc.DeezerId);

	const DzMusicsFormatted = DzMusics.map(
		(DzMusic) => ConvertTagsFromDzAlbum(
			DzMusic,
			AlbumDoc.Name,
			AlbumDoc.DeezerId,
		).ImportedMusic,
	);

	await AppendOrUpdateMusicsToAlbum(DzMusicsFormatted, AlbumDoc.DeezerId);

	await UpdateAlbumCompleteStatus(AlbumDoc.DeezerId);
}

async function CompleteArtist(ArtistDoc: IArtist) : Promise<void> {
	const DzAlbums = await GetAlbumsOfArtist(ArtistDoc.DeezerId);
	await HandleAlbumsFromDz(ArtistDoc.DeezerId, DzAlbums);
}

export {
	CompleteAlbum,
	CompleteArtist,
	SearchMusics,
};
