import { DeezerAlbumCoverRequest, DeezerAlbumMusicsRequest } from 'lib/Requests/DeezerIndexer';
import { Instance, PluginOptions } from 'seneca';

export default function DeezerAlbumIndexerPlugin(this: Instance, option: PluginOptions): void {
	this.add('req:index,from:deezer,type:album,what:musics', (msg: DeezerAlbumMusicsRequest, reply) => {
		reply(null, undefined);
	});
}
