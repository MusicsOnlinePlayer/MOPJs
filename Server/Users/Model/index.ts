import mongoose, { PassportLocalSchema } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';
import mongoosastic from 'mongoosastic';
import { EsHost } from '../../Config/MopConf.json';
import { MusicSchema } from '../../Musics/Model';
import { IUser } from './Interfaces';

const UserSchema = new mongoose.Schema({
	username: { type: String, es_indexed: 'true' },
	ViewedMusics: [{
		type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: MusicSchema, es_select: 'Title Artist Album',
	}],
	LikedMusics: [{
		type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: MusicSchema, es_select: 'Title Artist Album',
	}],
	CurrentPlaylist: [{
		type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: MusicSchema, es_select: 'Title Artist Album',
	}],
	CurrentPlaylistPlaying: { type: Number, es_indexed: 'true', default: 0 },
});

UserSchema.plugin(mongoosastic, {
	hosts: [EsHost],
	populate: [
		{ path: 'ViewedMusics', select: 'Title Artist Album' },
		{ path: 'LikedMusics', select: 'Title Artist Album' },
		{ path: 'CurrentPlaylist', select: 'Title Artist Album' },
	],
});

UserSchema.plugin(passportLocalMongoose);
// eslint-disable-next-line import/prefer-default-export
export const User = mongoose.model<IUser>('User', UserSchema as PassportLocalSchema, 'User');
