import mongoose from "mongoose";

export interface IUser extends mongoose.PassportLocalDocument {
	username: string;
	LikedMusics: [mongoose.Types.ObjectId];
	ViewedMusics: [mongoose.Types.ObjectId];
	CurrentPlaylist: [mongoose.Types.ObjectId];
	CurrentPlaylistPlaying: number;
}

export function isUser(obj: IUser | any): obj is IUser {
	return obj && obj.username && typeof obj.username === "string";
}
