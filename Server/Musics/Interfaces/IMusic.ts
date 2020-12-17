import mongoose from 'mongoose';

export interface IMusic extends mongoose.Document {
	Title: string,
	Artist: string,
	Album: string,
	AlbumId: mongoose.Types.ObjectId,
	PublishedDate?: Date,
	TrackNumber: number,
	FilePath?: string,
	DeezerId?: number,
	Views: number,
	Likes: number,
	LastView?: Date,
}

export function isMusic(obj: IMusic | any) : obj is IMusic {
	return (obj && obj.Title && typeof obj.Title === 'string');
}
