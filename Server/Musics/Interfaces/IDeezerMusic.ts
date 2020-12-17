import { IDeezerAlbum } from './IDeezerAlbum';
import { IDeezerArtist } from './IDeezerArtist';

export interface IDeezerMusic {
	id: number,
	title : string,
	album : IDeezerAlbum,
	artist: IDeezerArtist,
	track_position: number
}
