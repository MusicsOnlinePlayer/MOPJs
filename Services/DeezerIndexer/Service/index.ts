import MopConsole from 'lib/MopConsole';
import express from 'express';
import { ConnectToDB } from 'lib/Database';
import DeezerAlbumPlugin from './Plugins/DeezerAlbumPlugin';
import DeezerMusicPlugin from './Plugins/DeezerMusicPlugin';
import bodyParser from 'body-parser';

const LogLocation = 'Services.DeezerIndexer';
const app = express();

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

ConnectToDB(process.env.MONGO_URL, process.env.USE_MONGO_AUTH === 'true')
	.then(() => {
		MopConsole.info(LogLocation, `Connected to mongodb`);
		app.get('/ready', (req, res) => res.sendStatus(200));
		app.use('/Album', DeezerAlbumPlugin);
		app.use('/Music', DeezerMusicPlugin);

		app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
		process.exit(1);
	});
