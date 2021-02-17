import MopConsole from 'lib/MopConsole';
import express from 'express';
import DeezerMusicPlugin from './Plugins/DeezerMusicPlugin';
import DeezerAlbumPlugin from './Plugins/DeezerAlbumPlugin';
import bodyParser from 'body-parser';

const LogLocation = 'Services.DeezerImporter';
const app = express();

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);
app.use('/Music', DeezerMusicPlugin);
app.use('/Album', DeezerAlbumPlugin);

app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
