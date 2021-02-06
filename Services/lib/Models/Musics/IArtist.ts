import mongoose from 'mongoose';

export interface IArtist extends mongoose.Document{
	Name: string,
	DeezerId?: number,
	AlbumsId: [mongoose.Types.ObjectId],
	ImagePath?: string,
}

export function isArtist(obj: IArtist | any) : obj is IArtist {
	return (obj && obj.Name && typeof obj.Name === 'string');
}
