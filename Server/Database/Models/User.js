const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const mongoosastic = require('mongoosastic');
const { EsHost } = require('../../Config/MopConf.json');
const { MusicSchema } = require('./Music');

const User = new mongoose.Schema({
	username: { type: String, es_indexed: 'true' },
	ViewedMusics: [{
		type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: MusicSchema, es_select: 'Title Artist Album',
	}],
	LikedMusics: [{
		type: mongoose.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: MusicSchema, es_select: 'Title Artist Album',
	}],
});
User.plugin(passportLocalMongoose);

User.plugin(mongoosastic, {
	hosts: [EsHost],
	populate: [
		{ path: 'ViewedMusics', select: 'Title Artist Album' },
		{ path: 'LikedMusics', select: 'Title Artist Album' },
	],
});


module.exports = {
	User: mongoose.model('User', User, 'User'),
};
