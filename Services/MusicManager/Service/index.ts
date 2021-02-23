import MopConsole from 'lib/MopConsole';
import express from 'express';
import AlbumPlugin from './Album';
import ArtistPlugin from './Artist';
import bodyParser from 'body-parser';
import { ConnectToDB } from 'lib/Database';

const LogLocation = 'Services.MusicManager';
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
		app.use('/Album', AlbumPlugin);
		app.use('/Artist', ArtistPlugin);

		app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
		process.exit(1);
	});
