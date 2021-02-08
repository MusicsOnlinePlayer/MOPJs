import { IMusic } from "lib/Models/Musics";

export interface DeezerAlbumCoverReply {
  path: string;
}

export interface DeezerAlbumMusicsReply {
  Musics: IMusic[];
}
