import { IDeezerArtist } from "./IDeezerArtist";

export interface IDeezerAlbum {
	id: number,
	title: string
	cover_big: string
	artist? : IDeezerArtist
}
