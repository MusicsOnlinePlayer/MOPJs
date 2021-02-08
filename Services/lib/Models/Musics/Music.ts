import mongoose from "mongoose";
import { IAlbum, IArtist, IMusic, IPlaylist } from ".";

const MusicSchema = new mongoose.Schema({
	Title: { type: String, es_indexed: true, es_boost: 8.0 },
	Artist: { type: String, es_indexed: true, es_boost: 1.0 },
	Album: { type: String, es_indexed: true },
	AlbumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
	PublishedDate: { type: Date, es_type: "date", es_indexed: true },
	TrackNumber: Number,
	FilePath: String,
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
	Views: { type: Number, default: 0, es_indexed: true },
	Likes: { type: Number, default: 0, es_indexed: true },
	Rank: { type: Number, default: 0, es_indexed: true },
	LastView: { type: Date, es_type: "date", es_indexed: true },
});

MusicSchema.index(
	{
		Title: "text",
		Artist: "text",
		Album: "text",
	},
	{
		weights: {
			Title: 4,
			Artist: 2,
			Album: 1,
		},
	}
);

const AlbumSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
	Image: String,
	ImageFormat: String,
	ImagePathDeezer: String,
	IsComplete: { type: Boolean, default: false },
	MusicsId: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Music",
		},
	],
});

AlbumSchema.index({ Name: "text" });

const ArtistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	DeezerId: { type: Number, index: { unique: true, sparse: true } },
	AlbumsId: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Album",
		},
	],
	ImagePath: String,
});

ArtistSchema.index({ Name: "text" });

const PlaylistSchema = new mongoose.Schema({
	Name: { type: String, es_indexed: true },
	IsPublic: { type: Boolean, es_indexed: true },
	Creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	MusicsId: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Music",
		},
	],
});

PlaylistSchema.index({ Name: "text" });

ArtistSchema.statics.findOneOrCreate = async function findOneOrCreate(
	condition: mongoose.FilterQuery<IArtist>,
	doc: IArtist
) {
	const one = await this.findOne(condition);

	return one || (await this.create(doc));
};

AlbumSchema.statics.findOneOrCreate = async function findOneOrCreate(
	condition: mongoose.FilterQuery<IAlbum>,
	doc: IArtist
) {
	const one = await this.findOne(condition);

	return one || (await this.create(doc));
};

export interface IAlbumModel extends mongoose.Model<IAlbum> {
	findOneOrCreate(
		condition: mongoose.FilterQuery<IAlbum>,
		doc: IAlbum
	): Promise<IAlbum>;
}
export interface IArtistModel extends mongoose.Model<IArtist> {
	findOneOrCreate(
		condition: mongoose.FilterQuery<IAlbum>,
		doc: IArtist
	): Promise<IArtist>;
}
export interface IMusicModel extends mongoose.Model<IMusic> {}
export interface IPlaylistModel extends mongoose.Model<IPlaylist> {}

export const MusicModel = mongoose.model<IMusic, IMusicModel>(
	"Music",
	MusicSchema,
	"Music"
);
export const AlbumModel = mongoose.model<IAlbum, IAlbumModel>(
	"Album",
	AlbumSchema,
	"Album"
);
export const ArtistModel = mongoose.model<IArtist, IArtistModel>(
	"Artist",
	ArtistSchema,
	"Artist"
);
export const PlaylistModel = mongoose.model<IPlaylist, IPlaylistModel>(
	"Playlist",
	PlaylistSchema,
	"Playlist"
);

export { MusicSchema };
