import { IDeezerMusic } from 'lib/Types/Deezer';
import { Album, Artist, IAlbum, IArtist, IArtistModel, IMusic, Music } from 'lib/Models/Musics';
import MopConsole from 'lib/MopConsole';
import { GetTagsFromDeezerSearchMusics } from '../Transformer/Music';
import { BulkWriteOperation, ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const LogLocation = 'Services.DeezerIndexer.Indexer.Music';
const db = mongoose.connection.db;

export const IndexDeezerMusics = async (DeezerMusics: IDeezerMusic[]): Promise<ObjectId[]> => {
	const startTime = Date.now();
	MopConsole.debug(LogLocation, `Indexing ${DeezerMusics.length} musics`);

	const ParsedEntries = DeezerMusics.map((m) => GetTagsFromDeezerSearchMusics(m));
	const ParsedMusics = ParsedEntries.map((m) => m.ImportedMusic);
	const ParsedAlbums = ParsedEntries.map((m) => m.ImportedAlbum);
	const ParsedArtists = ParsedEntries.map((m) => m.ImportedArtist);

	// Inserting all musics only if it doesn't exists (by DeezerId)

	const MusicsBulk = Music.collection.initializeUnorderedBulkOp();
	ParsedMusics.forEach((m) => {
		MusicsBulk.find({ DeezerId: m.DeezerId }).upsert().updateOne({ $setOnInsert: m });
	});
	const BulkMusicInsert = await MusicsBulk.execute();

	MopConsole.debug(LogLocation, `Added ${BulkMusicInsert.nUpserted}/${ParsedMusics.length} musics`);

	// Inserting all album only if it doesn't exists (by DeezerId)
	// TODO check if orderedBulk is really mandatory.
	const AlbumBulk = Album.collection.initializeOrderedBulkOp();
	ParsedAlbums.forEach((a) => {
		AlbumBulk.find({
			Name: a.Name,
			$or: [{ DeezerId: a.DeezerId }, { DeezerId: undefined }],
		})
			.upsert()
			.updateOne({ $setOnInsert: a });
	});

	const BulkAlbumInsert = await AlbumBulk.execute();

	MopConsole.debug(LogLocation, `Added ${BulkAlbumInsert.nUpserted}/${ParsedAlbums.length} albums`);

	// Inserting all album only if it doesn't exists (by DeezerId)
	// TODO check if orderedBulk is really mandatory.
	const ArtistBulk = Artist.collection.initializeOrderedBulkOp();
	ParsedArtists.forEach((a) => {
		ArtistBulk.find({ Name: a.Name }).upsert().updateOne({ $setOnInsert: a });
	});

	const BulkArtistInsert = await ArtistBulk.execute();
	MopConsole.debug(LogLocation, `Added ${BulkArtistInsert.nUpserted}/${ParsedArtists.length} artists`);

	const AddedArtists = await Artist.find({
		_id: {
			$in: BulkArtistInsert.getUpsertedIds().map((k) => new ObjectId(k._id)),
		},
	});

	const AddedAlbums = await Album.find({
		_id: {
			$in: BulkAlbumInsert.getUpsertedIds().map((k) => new ObjectId(k._id)),
		},
	});

	const AddedMusics = await Music.find({
		_id: {
			$in: BulkMusicInsert.getUpsertedIds().map((k) => new ObjectId(k._id)),
		},
	});

	if (AddedMusics.length !== 0) {
		const UpdateMusicsBulk = Music.collection.initializeUnorderedBulkOp();
		const UpdateAlbumsBulk = Album.collection.initializeUnorderedBulkOp();
		const UpdateArtistsBulk = Artist.collection.initializeUnorderedBulkOp();

		const CorrespondingAlbums = await Album.find({
			DeezerId: { $in: ParsedAlbums.map((a) => a.DeezerId) },
		});
		AddedMusics.forEach((AddedMusic) => {
			const CorrespondingImportedEntry = ParsedEntries.find(
				(e) => e.ImportedMusic.DeezerId === AddedMusic.DeezerId
			);
			const CorrespondingAlbum = CorrespondingAlbums.find(
				(a) => a.DeezerId === CorrespondingImportedEntry.ImportedAlbum.DeezerId
			);
			UpdateMusicsBulk.find({ DeezerId: AddedMusic.DeezerId }).updateOne({
				$set: { AlbumId: CorrespondingAlbum._id },
			});
			UpdateAlbumsBulk.find({ _id: CorrespondingAlbum._id }).updateOne({
				$addToSet: { MusicsId: AddedMusic._id },
			});
			UpdateArtistsBulk.find({ Name: CorrespondingImportedEntry.ImportedArtist.Name }).updateOne({
				$addToSet: { AlbumsId: CorrespondingAlbum._id },
			});
		});

		const UpdateMusicsBulkResult = await UpdateMusicsBulk.execute();
		const UpdateAlbumsBulkResult = await UpdateAlbumsBulk.execute();
		const UpdateArtistsBulkResult = await UpdateArtistsBulk.execute();

		MopConsole.debug(LogLocation, `Updated ${UpdateMusicsBulkResult.nModified} musics`);
		MopConsole.debug(LogLocation, `Updated ${UpdateAlbumsBulkResult.nModified} albums`);
		MopConsole.debug(LogLocation, `Updated ${UpdateArtistsBulkResult.nModified} artists`);

		const Duration = Date.now() - startTime;
		MopConsole.debug(LogLocation, `Indexed ${AddedMusics.length} musics in ${Duration} ms`);
	}

	return BulkMusicInsert.getUpsertedIds().map((r) => r._id);
};
