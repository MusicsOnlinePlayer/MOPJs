import express from 'express';
import MopConsole from 'lib/MopConsole';
import MusicRoute from './Routes/Music';
import AlbumRoute from './Routes/Album';
import ArtistRoute from './Routes/Artist';

const app = express();
const LogLocation = 'Services.Frontend.Music';

app.use('/Music/Music', MusicRoute);
app.use('/Music/Album', AlbumRoute);
app.use('/Music/Artist', ArtistRoute);

const port = parseInt(process.env.PORT);

app.listen(port, () => MopConsole.info(LogLocation, `Listening on ${port}`));
