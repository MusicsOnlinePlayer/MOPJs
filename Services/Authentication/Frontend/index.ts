import express from 'express';
import bodyParser from 'body-parser';
import MopConsole from 'lib/MopConsole';
import UserAuthenticationPlugin from './Plugin/UserAuthenticationPlugin';
import passport from 'passport';
import { User } from 'lib/Models/Users';
import { ConnectToDB } from 'lib/Database';
import session from 'express-session';
import connectMongo from 'connect-mongo';
import mongoose from 'mongoose';

const MongoStore = connectMongo(session);
const app = express();
const port = parseInt(process.env.PORT);

const LogLocation = 'Services.Authentication';

ConnectToDB(process.env.MONGO_URL)
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
		app.use('/Auth', UserAuthenticationPlugin);

		app.listen(port, () => MopConsole.info(LogLocation, `Listening on ${port}`));
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
	});
