const mongoose = require('mongoose');
const mongoosastic = require('mongoosastic');
const { EsHost } = require('../../Config/MopConf.json');


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
	Views: { type: Number, default: 0, es_indexed: true },
	LastView: { type: Date, es_type: 'date', es_indexed: true },
}); // TODO Use timestamps = true

const AlbumSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: Number,
	MusicsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Music',
	}],
});

const ArtistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: Number,
	AlbumsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Album',
	}],
	ImagePath: String,
});

MusicSchema.plugin(mongoosastic, {
	hosts: [EsHost],
});
AlbumSchema.plugin(mongoosastic, {
	hosts: [EsHost],
});
ArtistSchema.plugin(mongoosastic, {
	hosts: [EsHost],
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
	MusicSchema,
};
