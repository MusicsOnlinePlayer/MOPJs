import { IDeezerMusic } from "../../Types/Deezer";

export interface DeezerAlbumCoverRequest {
  id: number;
  path: string;
}

export interface DeezerAlbumMusicsRequest {
  id: number;
  Musics: IDeezerMusic[];
}
