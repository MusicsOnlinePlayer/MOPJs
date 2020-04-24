const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');

const MusicSchema = new mongoose.Schema({
	Title: { type: String, es_indexed: true, es_boost: 8.0 },
	Artist: { type: String, es_indexed: true, es_boost: 1.0 },
	Album: { type: String, es_indexed: true },
	PublishedDate: { type: Date, es_type: 'date', es_indexed: true },
	TrackNumber: Number,
	FilePath: String,
	Image: String,
	ImageFormat: String,
	ImagePathDeezer: String,
	DeezerId: Number,
}); // TODO Use timestamps = true

const AlbumSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	MusicsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Music',
	}],
});

const ArtistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	AlbumsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Album',
	}],
	ImagePath: String,
});

MusicSchema.plugin(mongoosastic);
AlbumSchema.plugin(mongoosastic, {
	populate: [
		{ path: 'MusicsId', select: 'Title' },
	],
});
ArtistSchema.plugin(mongoosastic, {
	populate: [
		{ path: 'AlbumsId', select: 'Name' },
	],
}); //! Can be wrong here


ArtistSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
	const one = await this.findOne(condition);

	return one || this.create(doc);
});

AlbumSchema.static('findOneOrCreate', async function findOneOrCreate(condition, doc) {
	const one = await this.findOne(condition);

	return one || this.create(doc);
});

const MusicModel = mongoose.model('Music', MusicSchema, 'Music');
const AlbumModel = mongoose.model('Album', AlbumSchema, 'Album');
const ArtistModel = mongoose.model('Artist', ArtistSchema, 'Artist');

MusicModel.synchronize();
AlbumModel.synchronize();
ArtistModel.synchronize();

module.exports = {
	Music: MusicModel,
	Album: AlbumModel,
	Artist: ArtistModel,
};
