"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Interfaces_1 = require("../../Interfaces");
const Model_1 = require("../../Model");
const LogLocation = 'Musics.Proxy.DBProxy.Albums';
/** This function performs an artist search and will add all albums specified if it is unique
 * @param {number} ArtistDzId - The Deezer Id of the Artist
 * @param {Array<IAlbum>} Albums - All the albums of the artist that need to be added
 */
function AppendAlbumsToArtist(ArtistDzId, Albums) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const artistDoc = yield Model_1.Artist.findOne({ DeezerId: ArtistDzId });
        yield artistDoc.populate('AlbumsId').execPopulate();
        const AlbumTasks = [];
        Albums.forEach((AlbumElement) => {
            if (!artistDoc.AlbumsId.some((e) => (Interfaces_1.isAlbum(e) ? e.Name === AlbumElement.Name : false))) {
                AlbumTasks.push(new Promise((resolve) => {
                    const AlbumDoc = new Model_1.Album({
                        Name: AlbumElement.Name,
                        DeezerId: AlbumElement.DeezerId,
                        ImagePathDeezer: AlbumElement.ImagePathDeezer,
                    });
                    Model_1.Album.findOneOrCreate({ Name: AlbumDoc.Name, DeezerId: AlbumDoc.DeezerId }, AlbumDoc)
                        .then((newAlbum) => {
                        artistDoc.AlbumsId.push(newAlbum._id);
                        MopConsole_1.default.info(LogLocation, `Added ${AlbumDoc.Name} to artist with dzId ${ArtistDzId}`);
                        resolve();
                    })
                        .catch((err) => {
                        MopConsole_1.default.error(LogLocation, err);
                        resolve();
                    });
                }));
            }
        });
        yield Promise.all(AlbumTasks);
        yield artistDoc.save();
        MopConsole_1.default.info(LogLocation, `Saved ${AlbumTasks.length} albums`);
    });
}
/** This function performs a search on the database for an album containing a specific music.
 * @param {IMusic} MyMusic - Music
 * @return {Promise<IAlbum>} Album of the specified music
*/
exports.FindAlbumContainingMusic = (MyMusic) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    MopConsole_1.default.debug(LogLocation, `Finding album containing music with name ${MyMusic.Title}`);
    const AlbumCandidates = yield Model_1.Album.find({ Name: MyMusic.Album });
    if (AlbumCandidates.length < 1)
        return AlbumCandidates[0];
    let finalAlbum;
    AlbumCandidates.forEach((AlbumDoc) => {
        finalAlbum = AlbumDoc.MusicsId.find((id) => MyMusic._id.equals(id)) ? AlbumDoc : finalAlbum;
    });
    MopConsole_1.default.debug(LogLocation, `Found album named ${finalAlbum.Name} containing music with name ${MyMusic.Title}`);
    return finalAlbum;
});
/** This function add albums coming from deezer API to an existing artist.
 * This function runs sequentially
 * @param {number} ArtistId - Deezer Id of the artist (unique)
 * @param {Array<IDeezerAlbum>} DeezerAlbums - List of albums details
 */
exports.HandleAlbumsFromDz = (ArtistId, DeezerAlbums) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const Albums = [];
    DeezerAlbums.forEach((album) => {
        Albums.push({
            Name: album.title,
            DeezerId: album.id,
            ImagePathDeezer: album.cover_big,
        });
    });
    yield AppendAlbumsToArtist(ArtistId, Albums);
    MopConsole_1.default.info(LogLocation, 'Added albums to artist');
});
/** This function modify album states by modifying the IsComplete attribute
 * @param {number} AlbumDzId - Deezer id of the completed album
 */
exports.UpdateAlbumCompleteStatus = (AlbumDzId) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield Model_1.Album.findOneAndUpdate({ DeezerId: AlbumDzId }, { IsComplete: true });
    MopConsole_1.default.debug(LogLocation, `Set album with dz id ${AlbumDzId} as complete`);
});
