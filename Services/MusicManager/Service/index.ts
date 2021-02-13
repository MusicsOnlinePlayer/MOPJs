import MopConsole from 'lib/MopConsole';
import Seneca from 'seneca';

const LogLocation = 'Services.MusicManager';

Seneca({ tag: 'MusicManager' })
	.listen(3000)
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
