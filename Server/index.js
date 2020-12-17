/* eslint-disable import/first */
const dotenv = require('dotenv');

dotenv.config();

process.on('uncaughtException', (exception) => {
	console.error(exception);
});
process.on('unhandledRejection', (reason) => {
	console.error(reason);
});

import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {
	use, serializeUser, deserializeUser, initialize, session as _session,
} from 'passport';
import { json, urlencoded } from 'body-parser';
import compression from 'compression';
import { connection } from 'mongoose';

import MS from 'connect-mongo';
import { User } from './Users/Model';
import { MopPort } from './Config/MopConf.json';
import { MakeIndexation } from './Musics/Handler';
import { ConnectToDB } from './Database';

const app = express();

const MongoStore = MS(session);
// app.use(compression);

ConnectToDB().then(() => {
	MakeIndexation();

	app.use(cookieParser());

	app.use(json());
	app.use(urlencoded({
		extended: true,
	}));

	app.use(session({
		secret: 'zuehfzgbvchbsgvrcghuzebcrvgvzgervf',
		resave: false,
		saveUninitialized: true,
		store: new MongoStore({ mongooseConnection: connection }),
	}));

	use(User.createStrategy());
	serializeUser(User.serializeUser());
	deserializeUser(User.deserializeUser());

	app.use(initialize());
	app.use(_session());

	if (process.env.NODE_ENV === 'production') app.use(compression());

	app.use(require('./Routes/index').default);

	app.listen(MopPort);
});
