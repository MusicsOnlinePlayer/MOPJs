import MopConsole from 'lib/MopConsole';
import express from 'express';
import bodyParser from 'body-parser';
import UserDataPlugin from './Plugin/UserDataPlugin';
import UserAuthenticationPlugin from './Plugin/UserAuthenticationPlugin';
import { ConnectToDB } from 'lib/Database';

const LogLocation = 'Services.UserManager';
const app = express();

ConnectToDB(process.env.MONGO_URL, process.env.USE_MONGO_AUTH === 'true')
	.then(() => {
		MopConsole.info(LogLocation, `Connected to mongodb`);
		app.use(bodyParser.json());
		app.use(
			bodyParser.urlencoded({
				extended: true,
			})
		);
		app.use('/', UserDataPlugin);
		app.use('/', UserAuthenticationPlugin);
		app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
		process.exit(1);
	});
