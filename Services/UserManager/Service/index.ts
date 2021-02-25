import MopConsole from 'lib/MopConsole';
import express from 'express';
import bodyParser from 'body-parser';
import UserDataPlugin from './Plugin/UserDataPlugin';
import UserCurrentPlaylist from './Plugin/UserCurrentPlaylist';
import passport from 'passport';
import { User } from 'lib/Models/Users';
import { ConnectToDB } from 'lib/Database';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

const MongoStore = connectMongo(session);
const LogLocation = 'Services.UserManager';
const app = express();

ConnectToDB(process.env.MONGO_URL, process.env.USE_MONGO_AUTH === 'true')
	.then(() => {
		MopConsole.info(LogLocation, `Connected to mongodb`);
		passport.use(User.createStrategy());
		passport.serializeUser(User.serializeUser());
		passport.deserializeUser(User.deserializeUser());

		app.use(
			session({
				secret: 'secret',
				resave: false,
				saveUninitialized: true,
				name: 'mop.session',
				store: new MongoStore({ mongooseConnection: mongoose.connection }),
			})
		);
		app.use(passport.initialize());
		app.use(passport.session());

		app.use(bodyParser.json());
		app.use(
			bodyParser.urlencoded({
				extended: true,
			})
		);
		app.use('/User', UserDataPlugin);
		app.use('/User/CurrentPlaylist', UserCurrentPlaylist);
		app.listen(8080, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
		process.exit(1);
	});
