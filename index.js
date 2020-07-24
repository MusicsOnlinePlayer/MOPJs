const express = require('express');

const app = express();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const passport = require('passport');

const bodyParser = require('body-parser');
const compression = require('compression');
const mongoose = require('mongoose');
const MopConsole = require('./Server/Tools/MopConsole');
const { User } = require('./Server/Users/Model');
const { MopPort } = require('./Server/Config/MopConf.json');
const { MakeIndexation } = require('./Server/Musics/Handler');
const { ConnectToDB } = require('./Server/Database');
// app.use(compression);

process.on('uncaughtException', (exception) => {
	MopConsole.error('ExceptionHandler', exception);
	MopConsole.error('ExceptionHandler', exception.stack);
});

ConnectToDB().then(() => {
	MakeIndexation();


	app.use(cookieParser());

	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({
		extended: true,
	}));


	app.use(session({
		secret: 'zuehfzgbvchbsgvrcghuzebcrvgvzgervf',
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
	}));


	passport.use(User.createStrategy());
	passport.serializeUser(User.serializeUser());
	passport.deserializeUser(User.deserializeUser());

	app.use(passport.initialize());
	app.use(passport.session());

	if (process.env.NODE_ENV === 'production') app.use(compression());

	app.use(require('./Server/Routes/index'));

	app.listen(MopPort);
});
