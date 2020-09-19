const mongoose = require('mongoose');
const elasticsearch = require('elasticsearch');
const mongoosastic = require('mongoosastic');
const { EsHost } = require('../../Config/MopConf.json');

const esClient = elasticsearch.Client({
	host: EsHost,
});

const MusicSchema = new mongoose.Schema({
	Title: { type: String, es_indexed: true, es_boost: 8.0 },
	Artist: { type: String, es_indexed: true, es_boost: 1.0 },
	Album: { type: String, es_indexed: true },
	PublishedDate: { type: Date, es_type: 'date', es_indexed: true },
	TrackNumber: Number,
	FilePath: String,
	DeezerId: { type: Number, index: { unique: true, dropDups: true, sparse: true } },
	Views: { type: Number, default: 0, es_indexed: true },
	Likes: { type: Number, default: 0, es_indexed: true },
	LastView: { type: Date, es_type: 'date', es_indexed: true },
});

MusicSchema.index({
	Title: 'text',
	Artist: 'text',
	Album: 'text',
}, {
	weights: {
		Title: 4,
		Artist: 2,
		Album: 1,
	},
});

const AlbumSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: { type: Number, index: { unique: true, dropDups: true, sparse: true } },
	Image: String,
	ImageFormat: String,
	ImagePathDeezer: String,
	IsComplete: { type: Boolean, default: false },
	MusicsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Music',
	}],
});

AlbumSchema.index({ Name: 'text' });

const ArtistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: { type: Number, index: { unique: true, dropDups: true, sparse: true } },
	AlbumsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Album',
	}],
	ImagePath: String,
});

ArtistSchema.index({ Name: 'text' });


const PlaylistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	IsPublic: { type: Boolean, es_indexed: true },
	Creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	MusicsId: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Music',
	}],
});

PlaylistSchema.index({ Name: 'text' });

if (process.env.NODE_ENV !== 'test') {
	MusicSchema.plugin(mongoosastic, {
		esClient,
	});
	AlbumSchema.plugin(mongoosastic, {
		esClient,
	});
	ArtistSchema.plugin(mongoosastic, {
		esClient,
	});
	PlaylistSchema.plugin(mongoosastic, {
		esClient,
	});
}


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
const PlaylistModel = mongoose.model('Playlist', PlaylistSchema, 'Playlist');

if (process.env.NODE_ENV !== 'test') {
	MusicModel.synchronize();
	AlbumModel.synchronize();
	ArtistModel.synchronize();
	PlaylistModel.synchronize();
}
module.exports = {
	Music: MusicModel,
	Album: AlbumModel,
	Artist: ArtistModel,
	Playlist: PlaylistModel,
	MusicSchema,
	esClient,
};
