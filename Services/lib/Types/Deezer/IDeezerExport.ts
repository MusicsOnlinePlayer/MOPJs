import { IAlbum, IArtist, IMusic } from "../../Models/Musics";

export interface IDeezerExport {
  ImportedMusic: IMusic;
  ImportedAlbum: IAlbum;
  ImportedArtist: IArtist;
}
