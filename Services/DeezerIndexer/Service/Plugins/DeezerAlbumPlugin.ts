import { DeezerAlbumCoverRequest, DeezerAlbumMusicsRequest } from 'lib/Requests/DeezerIndexer';
import { DeezerAlbumMusicsResponse, DeezerAlbumCoverResponse } from 'lib/Responses/DeezerIndexer/Album';
import { Instance, PluginOptions } from 'seneca';
import { IndexAlbumMusics, SetDeezerCoverOfAlbum } from '../Indexer/Album';

export default function DeezerAlbumIndexerPlugin(this: Instance, option: PluginOptions): void {
	this.add('req:index,from:deezer,type:album,what:musics', (msg: DeezerAlbumMusicsRequest, reply) => {
		IndexAlbumMusics(msg.id, msg.Musics)
			.then((Album) => reply(null, <DeezerAlbumMusicsResponse>{ Album }))
			.catch((err) => reply(err));
	});

	this.add('req:index,from:deezer,type:album,what:cover', (msg: DeezerAlbumCoverRequest, reply) => {
		SetDeezerCoverOfAlbum(msg.id, msg.path)
			.then((Album) => reply(null, <DeezerAlbumCoverResponse>{ Album }))
			.catch((err) => reply(err));
	});
}
