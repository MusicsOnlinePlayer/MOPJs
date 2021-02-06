import { IDeezerAlbum } from "../../Types/Deezer";

export interface DeezerArtistPictureReply {
  path: string;
}

export interface DeezerArtistAlbumsReply {
  Albums: IDeezerAlbum[];
}
