import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export interface IUser extends mongoose.PassportLocalDocument {
	username: string,
	LikedMusics: Array<ObjectId>,
	ViewedMusics: Array<ObjectId>,
	CurrentPlaylist: Array<ObjectId>,
	CurrentPlaylistPlaying: number
}

export function isUser(obj: IUser | any) : obj is IUser {
	return (obj && obj.username && typeof obj.username === 'string');
}
