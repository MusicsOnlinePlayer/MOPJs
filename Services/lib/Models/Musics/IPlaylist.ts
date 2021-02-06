import mongoose from 'mongoose';

export interface IPlaylist extends mongoose.Document {
	Name: string,
	IsPublic: boolean,
	Creator: mongoose.Types.ObjectId,
	MusicsId: [mongoose.Types.ObjectId],
}

export function isPlaylist(obj: IPlaylist | any) : obj is IPlaylist {
	return (obj && obj.Title && typeof obj.Title === 'string');
}
