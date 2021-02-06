import { DeezerAlbumCoverImport, DeezerAlbumMusicsImport } from 'lib/Requests/DeezerImporter';
import { DeezerAlbumCoverReply, DeezerAlbumMusicsReply } from 'lib/Responses/DeezerImporter';
import { Instance, PluginOptions } from 'seneca';
import { GetDeezerAlbumCover, GetDeezerAlbumMusics } from '../DeezerApi/Album';

export default function DeezerAlbumPlugin(this: Instance, option: PluginOptions): void {
	this.add('req:import,from:deezer,type:album,what:cover', (msg: DeezerAlbumCoverImport, reply) => {
		GetDeezerAlbumCover(msg.DeezerId)
			.then((DeezerPath) => reply(null, <DeezerAlbumCoverReply>{ path: DeezerPath }))
			.catch((err) => reply(err));
	});
	this.add('req:import,from:deezer,type:album,what:musics', (msg: DeezerAlbumMusicsImport, reply) => {
		GetDeezerAlbumMusics(msg.DeezerId)
			.then((DeezerArtists) => reply(null, <DeezerAlbumMusicsReply>{ Musics: DeezerArtists }))
			.catch((err) => reply(err));
	});
}
