import { Instance, PluginOptions } from 'seneca';
import { GetDeezerArtistImage } from './../DeezerApi/Artist';

interface DeezerArtistPictureImport {
	DeezerId: number;
}

export default function DeezerPlugin(this: Instance, option: PluginOptions): void {
	this.add('req:import,from:deezer,type:artist,what:picture', (msg: DeezerArtistPictureImport, reply) => {
		GetDeezerArtistImage(msg.DeezerId)
			.then((DeezerPath) => reply(null, { path: DeezerPath }))
			.catch((err) => reply(err));
	});
}
