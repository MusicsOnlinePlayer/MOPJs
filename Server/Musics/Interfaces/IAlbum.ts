import mongoose from 'mongoose';
import { IMusic } from './IMusic';

export interface IAlbum extends mongoose.Document{
	Name: string,
	DeezerId?: number,
	Image?: string,
	ImageFormat?: string,
	ImagePathDeezer?: string,
	IsComplete: boolean,
	MusicsId: [mongoose.Types.ObjectId | IMusic],
}

export function isAlbum(obj: IAlbum | any) : obj is IAlbum {
	return (obj && obj.Name && typeof obj.Name === 'string');
}
