import MopConsole from '../../../Tools/MopConsole';
import {
	IAlbum, IDeezerAlbum, IMusic, isAlbum,
} from '../../Interfaces';
import {
	Album, Artist,
} from '../../Model';

const LogLocation = 'Musics.Proxy.DBProxy.Albums';

/** This function performs an artist search and will add all albums specified if it is unique
 * @param {number} ArtistDzId - The Deezer Id of the Artist
 * @param {Array<IAlbum>} Albums - All the albums of the artist that need to be added
 */
async function AppendAlbumsToArtist(ArtistDzId: number, Albums: Array<IAlbum>) {
	const artistDoc = await Artist.findOne({ DeezerId: ArtistDzId });
	await artistDoc.populate('AlbumsId').execPopulate();

	const AlbumTasks : Array<Promise<void>> = [];

	Albums.forEach((AlbumElement) => {
		if (!artistDoc.AlbumsId.some((e) => (isAlbum(e) ? e.Name === AlbumElement.Name : false))) {
			AlbumTasks.push(new Promise((resolve) => {
				const AlbumDoc = new Album({
					Name: AlbumElement.Name,
					DeezerId: AlbumElement.DeezerId,
					ImagePathDeezer: AlbumElement.ImagePathDeezer,
				});

				Album.findOneOrCreate({ Name: AlbumDoc.Name, DeezerId: AlbumDoc.DeezerId }, AlbumDoc)
					.then((newAlbum) => {
						artistDoc.AlbumsId.push(newAlbum._id);
						MopConsole.info(LogLocation, `Added ${AlbumDoc.Name} to artist with dzId ${ArtistDzId}`);
						resolve();
					})
					.catch((err) => {
						MopConsole.error(LogLocation, err);
						resolve();
					});
			}));
		}
	});

	await Promise.all(AlbumTasks);

	await artistDoc.save();
	MopConsole.info(LogLocation, `Saved ${AlbumTasks.length} albums`);
}

/** This function performs a search on the database for an album containing a specific music.
 * @param {IMusic} MyMusic - Music
 * @return {Promise<IAlbum>} Album of the specified music
*/
export const FindAlbumContainingMusic = async (MyMusic: IMusic) : Promise<IAlbum> => {
	MopConsole.debug(LogLocation, `Finding album containing music with name ${MyMusic.Title}`);
	const AlbumCandidates = await Album.find({ Name: MyMusic.Album });
	if (AlbumCandidates.length < 1) return AlbumCandidates[0];
	let finalAlbum: IAlbum;
	AlbumCandidates.forEach((AlbumDoc) => {
		finalAlbum = AlbumDoc.MusicsId.find((id) => MyMusic._id.equals(id)) ? AlbumDoc : finalAlbum;
	});
	MopConsole.debug(LogLocation, `Found album named ${finalAlbum.Name} containing music with name ${MyMusic.Title}`);
	return finalAlbum;
};

/** This function add albums coming from deezer API to an existing artist.
 * This function runs sequentially
 * @param {number} ArtistId - Deezer Id of the artist (unique)
 * @param {Array<IDeezerAlbum>} DeezerAlbums - List of albums details
 */
export const HandleAlbumsFromDz = async (
	ArtistId: number, DeezerAlbums: Array<IDeezerAlbum>,
): Promise<void> => {
	const Albums : Array<IAlbum> = [];
	DeezerAlbums.forEach((album) => {
		Albums.push({
			Name: album.title,
			DeezerId: album.id,
			ImagePathDeezer: album.cover_big,
		} as IAlbum);
	});
	await AppendAlbumsToArtist(ArtistId, Albums);
	MopConsole.info(LogLocation, 'Added albums to artist');
};

/** This function modify album states by modifying the IsComplete attribute
 * @param {number} AlbumDzId - Deezer id of the completed album
 */
export const UpdateAlbumCompleteStatus = async (AlbumDzId: number): Promise<void> => {
	await Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
	MopConsole.debug(LogLocation, `Set album with dz id ${AlbumDzId} as complete`);
};
