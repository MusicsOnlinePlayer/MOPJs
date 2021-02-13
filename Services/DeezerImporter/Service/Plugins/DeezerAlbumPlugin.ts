// import { DeezerAlbumCoverImport, DeezerAlbumMusicsImport } from 'lib/Requests/DeezerImporter';
// import { DeezerAlbumMusicsRequest, DeezerAlbumCoverRequest } from 'lib/Requests/DeezerIndexer';

// import { DeezerAlbumMusicsResponse, DeezerAlbumCoverResponse } from 'lib/Responses/DeezerIndexer/Album';

// import { Instance, PluginOptions } from 'seneca';
// import { GetDeezerAlbumCover, GetDeezerAlbumMusics } from '../DeezerApi/Album';

// export default function DeezerAlbumPlugin(this: Instance, option: PluginOptions): void {
// 	this.add('req:import,from:deezer,type:album,what:cover', (msg: DeezerAlbumCoverImport, reply) => {
// 		GetDeezerAlbumCover(msg.DeezerId)
// 			.then((DeezerPath) => {
// 				this.act(
// 					'req:index,from:deezer,type:album,what:cover',
// 					<DeezerAlbumCoverRequest>{
// 						id: msg.DeezerId,
// 						path: DeezerPath,
// 					},
// 					(err, result: DeezerAlbumCoverResponse) => {
// 						if (err) reply(err);
// 						else reply(null, result);
// 					}
// 				);
// 			})
// 			.catch((err) => reply(err));
// 	});
// 	this.add('req:import,from:deezer,type:album,what:musics', (msg: DeezerAlbumMusicsImport, reply) => {
// 		GetDeezerAlbumMusics(msg.DeezerId)
// 			.then((DeezerMusics) => {
// 				this.act(
// 					'req:index,from:deezer,type:album,what:musics',
// 					<DeezerAlbumMusicsRequest>{
// 						id: msg.DeezerId,
// 						Musics: DeezerMusics,
// 					},
// 					(err, result: DeezerAlbumMusicsResponse) => {
// 						if (err) reply(err);
// 						else reply(null, result);
// 					}
// 				);
// 			})
// 			.catch((err) => reply(err));
// 	});
// }
