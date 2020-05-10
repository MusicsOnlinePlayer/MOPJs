const glob = require('glob');
const path = require('path');
const MopConsole = require('../Tools/MopConsole');

const plugins = [];

const GetAllPluginsPath = () => {
	const files = [];
	glob.sync('./Server/Plugins/Plugins/*.mop.js')
		.forEach((file) => files.push(path.resolve(file)));
	return files;
};

const LoadPlugins = () => {
	MopConsole.info('Plugins Loader', 'Searching for plugins');
	GetAllPluginsPath().forEach((pluginPath) => {
		plugins.push(require(pluginPath));
	});
	MopConsole.info('Plugins Loader', `Found ${plugins.length} plugins`);
	plugins.forEach((plugin) => {
		plugin.Start()
			.then(({ Name }) => {
				MopConsole.info('Plugins Loader', `Loaded ${Name}`);
			}).catch((err) => {
				MopConsole.error('Plugins Loader', err);
			});
	});
};





module.exports = {
	LoadPlugins,
};
