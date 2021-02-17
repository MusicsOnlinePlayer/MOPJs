import MopConsole from 'lib/MopConsole';
import express from 'express';
import MusicSearchPlugin from './Plugins/MusicSearchPlugin';
import AlbumSearchPlugin from './Plugins/AlbumSearchPlugin';
import ArtistSearchPlugin from './Plugins/ArtistSearchPlugin';
import bodyParser from 'body-parser';
import { ConnectToDB } from 'lib/Database';

const LogLocation = 'Services.MusicSearch';
const app = express();

ConnectToDB(process.env.MONGO_URL, process.env.USE_MONGO_AUTH === 'true')
	.then(() => {
		MopConsole.info(LogLocation, `Connected to mongodb`);
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
		process.exit(1);
	});

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use('/Music', MusicSearchPlugin);
app.use('/Album', AlbumSearchPlugin);
app.use('/Artist', ArtistSearchPlugin);

app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
