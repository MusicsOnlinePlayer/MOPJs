import MopConsole from 'lib/MopConsole';
import Seneca from 'seneca';
import DeezerPlugin from './Plugins/DeezerPlugin';

const LogLocation = 'Services.DeezerImporter';

Seneca({ tag: 'DeezerImporter' })
	.use(DeezerPlugin)
	.ready(function (err) {
		if (err) MopConsole.error(LogLocation, err.message);

		MopConsole.warn(LogLocation, `Service ${this.id} ready`);

		const pluginsNames = Object.keys(this.list_plugins());
		MopConsole.info(LogLocation, `Plugins loaded (${pluginsNames.length}): `);
		for (const plugin of pluginsNames) {
			MopConsole.info(LogLocation, ` - ${plugin}`);
		}
	});
