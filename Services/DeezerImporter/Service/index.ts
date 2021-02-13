import MopConsole from 'lib/MopConsole';
import express from 'express';
import DeezerMusicPlugin from './Plugins/DeezerMusicPlugin';
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

app.listen(3000, () => MopConsole.info(LogLocation, 'Waiting for requests on 3000'));
