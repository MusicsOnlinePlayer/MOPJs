import { Album, Artist, IAlbum, IArtist, IMusic, Music } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';
import { BulkWriteResult } from 'mongodb';

const LogLocation = 'Services.DeezerIndexer.Indexer.Helper';

export const BulkInsertAlbums = async (ImportedAlbums: IAlbum[]): Promise<BulkWriteResult> => {
	const AlbumBulk = Album.collection.initializeOrderedBulkOp();
	ImportedAlbums.forEach((a) => {
		AlbumBulk.find({
			Name: a.Name,
			$or: [{ DeezerId: a.DeezerId }, { DeezerId: undefined }],
		})
			.upsert()
			.updateOne({ $setOnInsert: a });
	});

	const BulkAlbumInsert = await AlbumBulk.execute();

	MopConsole.debug(LogLocation, `Added ${BulkAlbumInsert.nUpserted}/${ImportedAlbums.length} albums`);
	return BulkAlbumInsert;
};

export const BulkInsertArtists = async (ImportedArtists: IArtist[]): Promise<BulkWriteResult> => {
	const ArtistBulk = Artist.collection.initializeOrderedBulkOp();
	ImportedArtists.forEach((a) => {
		ArtistBulk.find({ Name: a.Name }).upsert().updateOne({ $setOnInsert: a });
	});

	const BulkArtistInsert = await ArtistBulk.execute();
	MopConsole.debug(LogLocation, `Added ${BulkArtistInsert.nUpserted}/${ImportedArtists.length} artists`);
	return BulkArtistInsert;
};

export const BulkInsertMusics = async (ImportedMusics: IMusic[]): Promise<BulkWriteResult> => {
	const MusicsBulk = Music.collection.initializeUnorderedBulkOp();
	ImportedMusics.forEach((m) => {
		MusicsBulk.find({ DeezerId: m.DeezerId }).upsert().updateOne({ $setOnInsert: m });
	});
	const BulkMusicInsert = await MusicsBulk.execute();

	MopConsole.debug(LogLocation, `Added ${BulkMusicInsert.nUpserted}/${ImportedMusics.length} musics`);
	return BulkMusicInsert;
};
