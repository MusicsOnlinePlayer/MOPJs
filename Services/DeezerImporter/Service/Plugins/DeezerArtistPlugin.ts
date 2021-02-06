import { DeezerArtistPictureImport, DeezerArtistAlbumsImport } from 'lib/Requests/DeezerImporter';
import { DeezerArtistAlbumsReply, DeezerArtistPictureReply } from 'lib/Responses/DeezerImporter';
import { Instance, PluginOptions } from 'seneca';
import { GetDeezerArtistImage, GetDeezerArtistAlbums } from '../DeezerApi/Artist';

export default function DeezerArtistPlugin(this: Instance, option: PluginOptions): void {
	this.add('req:import,from:deezer,type:artist,what:picture', (msg: DeezerArtistPictureImport, reply) => {
		GetDeezerArtistImage(msg.DeezerId)
			.then((DeezerPath) => reply(null, <DeezerArtistPictureReply>{ path: DeezerPath }))
			.catch((err) => reply(err));
	});
	this.add('req:import,from:deezer,type:artist,what:albums', (msg: DeezerArtistAlbumsImport, reply) => {
		GetDeezerArtistAlbums(msg.DeezerId)
			.then((DeezerAlbums) => reply(null, <DeezerArtistAlbumsReply>{ Albums: DeezerAlbums }))
			.catch((err) => reply(err));
	});
}
