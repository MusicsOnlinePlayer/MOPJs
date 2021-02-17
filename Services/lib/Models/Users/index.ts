import mongoose, { PassportLocalSchema } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";
import { MusicSchema } from "../Musics";
import { IUser } from "./IUser";

const UserSchema = new mongoose.Schema({
	username: { type: String, es_indexed: "true" },
	ViewedMusics: [
		{
			type: mongoose.Schema.Types.ObjectId,
			default: [],
			ref: "Music",
			es_indexed: true,
			es_schema: MusicSchema,
			es_select: "Title Artist Album",
		},
	],
	LikedMusics: [
		{
			type: mongoose.Schema.Types.ObjectId,
			default: [],
			ref: "Music",
			es_indexed: true,
			es_schema: MusicSchema,
			es_select: "Title Artist Album",
		},
	],
	CurrentPlaylist: [
		{
			type: mongoose.Schema.Types.ObjectId,
			default: [],
			ref: "Music",
			es_indexed: true,
			es_schema: MusicSchema,
			es_select: "Title Artist Album",
		},
	],
	CurrentPlaylistPlaying: { type: Number, es_indexed: "true", default: 0 },
});

UserSchema.plugin(passportLocalMongoose);

export const User = mongoose.model<IUser>(
	"User",
	UserSchema as PassportLocalSchema,
	"User"
);
export * from "./IUser";
