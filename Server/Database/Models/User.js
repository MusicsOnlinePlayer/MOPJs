const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const { EsHost } = require('../../Config/MopConf.json');

const User = new mongoose.Schema({});

User.plugin(passportLocalMongoose, {
	hosts: [EsHost],
});

module.exports = {
	User: mongoose.model('User', User, 'User'),
};
