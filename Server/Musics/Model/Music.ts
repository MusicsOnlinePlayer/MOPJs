import mongoose from 'mongoose';
import * as elasticsearch from 'elasticsearch';
import mongoosastic from 'mongoosastic';
import {
	IAlbum, IArtist, IMusic, IPlaylist,
} from '../Interfaces';
import { EsHost, UseMongoSearchIndex } from '../../Config/MopConf.json';

// eslint-disable-next-line import/no-mutable-exports
let esClient : elasticsearch.Client;
if (process.env.NODE_ENV !== 'test' && !UseMongoSearchIndex) {
	esClient = new elasticsearch.Client({
		host: EsHost,
	});
}
export { esClient };

const MusicSchema = new mongoose.Schema({
	Title: { type: String, es_indexed: true, es_boost: 8.0 },
	Artist: { type: String, es_indexed: true, es_boost: 1.0 },
	Album: { type: String, es_indexed: true },
	AlbumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
	PublishedDate: { type: Date, es_type: 'date', es_indexed: true },
	TrackNumber: Number,
	FilePath: String,
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
	Views: { type: Number, default: 0, es_indexed: true },
	Likes: { type: Number, default: 0, es_indexed: true },
	Rank: { type: Number, default: 0, es_indexed: true },
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
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
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
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
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

if (process.env.NODE_ENV !== 'test' && !UseMongoSearchIndex) {
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

ArtistSchema.static('findOneOrCreate', async function findOneOrCreate(condition: mongoose.FilterQuery<IArtist>, doc: IArtist) {
	const one = await this.findOne(condition);

	return one || await this.create(doc);
});

AlbumSchema.static('findOneOrCreate', async function findOneOrCreate(condition: mongoose.FilterQuery<IAlbum>, doc: IAlbum) {
	const one = await this.findOne(condition);

	return one || await this.create(doc);
});

export interface IAlbumModel extends mongoose.Model<IAlbum> {
	findOneOrCreate(condition: mongoose.FilterQuery<IAlbum>, doc: IAlbum): Promise<IAlbum>,
	search(
		searchParams: Record<string, unknown>,
		options: Record<string, unknown>,
		cb: (err : Error, results : {hits: {hits: IAlbum[]}}) => void
	): void
	synchronize(): void
}
export interface IArtistModel extends mongoose.Model<IArtist> {
	findOneOrCreate(condition: mongoose.FilterQuery<IAlbum>, doc: IArtist): Promise<IArtist>,
	search(
		searchParams: Record<string, unknown>,
		options: Record<string, unknown>,
		cb: (err : Error, results : {hits: {hits: IArtist[]}}) => void
	): void
	synchronize(): void
}
export interface IMusicModel extends mongoose.Model<IMusic> {
	search(
		searchParams: Record<string, unknown>,
		options: Record<string, unknown>,
		cb: (err : Error, results : {hits: {hits: IMusic[]}}) => void
	): void
	synchronize(): void
}
export interface IPlaylistModel extends mongoose.Model<IPlaylist> {
	search(
		searchParams: Record<string, unknown>,
		options: Record<string, unknown>,
		cb: (err : Error, results : {hits: {hits: IPlaylist[]}}) => void
	): void
	synchronize(): void
}

export const MusicModel = mongoose.model<IMusic, IMusicModel>('Music', MusicSchema, 'Music');
export const AlbumModel = mongoose.model<IAlbum, IAlbumModel>('Album', AlbumSchema, 'Album');
export const ArtistModel = mongoose.model<IArtist, IArtistModel>('Artist', ArtistSchema, 'Artist');
export const PlaylistModel = mongoose.model<IPlaylist, IPlaylistModel>('Playlist', PlaylistSchema, 'Playlist');

export { MusicSchema };

if (process.env.NODE_ENV !== 'test' && !UseMongoSearchIndex) {
	MusicModel.synchronize();
	AlbumModel.synchronize();
	ArtistModel.synchronize();
	PlaylistModel.synchronize();
}
