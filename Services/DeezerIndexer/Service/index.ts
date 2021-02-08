import MopConsole from 'lib/MopConsole';
import { ConnectToDB } from 'lib/Database';
import Seneca from 'seneca';
import DeezerAlbumPlugin from './Plugins/DeezerAlbumPlugin';

const LogLocation = 'Services.DeezerIndexer';

ConnectToDB(process.env.MONGO_URL, process.env.USE_MONGO_AUTH === 'true')
	.then(() => {
		MopConsole.info(LogLocation, `Connected to mongodb`);
		Seneca({ tag: 'DeezerIndexer' })
			.use(DeezerAlbumPlugin)
			.listen(3001)
			.ready(function (err) {
				if (err) MopConsole.error(LogLocation, err.message);

				MopConsole.warn(LogLocation, `Service ${this.tag} ready`);
				MopConsole.debug(LogLocation, `Id ${this.id}`);
				const pluginsNames = Object.keys(this.list_plugins());
				MopConsole.info(LogLocation, `Plugins loaded (${pluginsNames.length}): `);
				for (const plugin of pluginsNames) {
					MopConsole.info(LogLocation, ` - ${plugin}`);
				}
			});
	})
	.catch((err) => {
		MopConsole.error(LogLocation, err);
	});
