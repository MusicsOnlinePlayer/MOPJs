import { IDeezerMusic } from "../../Types/Deezer";

export interface DeezerAlbumCoverReply {
  path: string;
}

export interface DeezerAlbumMusicsReply {
  Musics: IDeezerMusic[];
}
