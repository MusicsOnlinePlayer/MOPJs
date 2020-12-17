import express from 'express';
import path from 'path';
import MopConsole from '../Tools/MopConsole';
import { MusicsFolder, ArtistsImageFolder } from '../Musics/Config';
import UserRoutes from './User';
import MusicRoutes from './Music';

const app = express();
export default app;
// const compression = require('compression');
app.use((req, res, next) => {
	if (res.statusCode === 404) MopConsole.warn('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);
	else MopConsole.standard('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);

	next();
});

app.use('/User', UserRoutes);
app.use('/Music', MusicRoutes);

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../../Public/index.html'));
});

const staticPath = path.join(__dirname, '../../Public/');

app.use(express.static(staticPath));
app.use(express.static(MusicsFolder));
app.use(express.static(ArtistsImageFolder));
app.use(express.static(path.join(__dirname, '../../Public/Dist')));
