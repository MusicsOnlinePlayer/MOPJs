const MopConsole = require('../../../Tools/MopConsole');
const { Album, Artist } = require('../../Model');

const LogLocation = 'Musics.Proxy.DBProxy.Albums';

/** This function performs an artist search and will add all albums specified if it is unique
 * @param {number} ArtistDzId - The Deezer Id of the Artist
 * @param {[object]} Albums - All the albums of the artist that need to be added
 */
async function AppendAlbumsToArtist(ArtistDzId, Albums) {
	const artistDoc = await Artist.findOne({ DeezerId: ArtistDzId });
	await artistDoc.populate('AlbumsId').execPopulate();

	const AlbumTasks = [];

	Albums.forEach((AlbumElement) => {
		if (!artistDoc.AlbumsId.some((e) => e.Name === AlbumElement.Name)) {
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

module.exports = {
	/** This function performs a search on the database for an album containing a specific music.
     * @param {object} MyMusic - Music
     * @param {string} MyMusic.Album - Name of the album
     * @param {ObjectId} MyMusic._id - MongoDB id
     * @return {Album} Album of the specified music
    */
	FindAlbumContainingMusic: async (MyMusic) => {
		MopConsole.debug(LogLocation, `Finding album containing music with name ${MyMusic.Title}`);
		const AlbumCandidates = await Album.find({ Name: MyMusic.Album });
		if (AlbumCandidates.length < 1) return AlbumCandidates[0];
		let finalAlbum;
		AlbumCandidates.forEach((AlbumDoc) => {
			finalAlbum = AlbumDoc.MusicsId.find((id) => MyMusic._id.equals(id)) ? AlbumDoc : finalAlbum;
		});
		MopConsole.debug(LogLocation, `Found album named ${finalAlbum.Name} containing music with name ${MyMusic.Title}`);
		return finalAlbum;
	},
	/** This function add albums coming from deezer API to an existing artist.
	 * This function run sequentially
	 * @param {number} ArtistId - Deezer Id of the artist (unique)
	 * @param {[object]} DeezerAlbums - List of albums details
	 */
	HandleAlbumsFromDz: async (ArtistId, DeezerAlbums) => {
		const Albums = [];
		DeezerAlbums.forEach((album) => {
			Albums.push({ Name: album.title, DeezerId: album.id, ImagePathDeezer: album.cover_big });
		});
		await AppendAlbumsToArtist(ArtistId, Albums);
		MopConsole.info(LogLocation, 'Added albums to artist');
	},
};
