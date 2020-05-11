const mongoose = require('mongoose');
const MopConsole = require('../Tools/MopConsole');

const { MongoUrl } = require('../Config/MopConf.json');

module.exports = {
	ConnectToDB: () => new Promise((resolve) => {
		MopConsole.info('DB', 'Connecting to mongo database');
		mongoose.connect(MongoUrl, { useNewUrlParser: true, auth: { authSource: 'admin' } });
		const DataBase = mongoose.connection;
		DataBase.on('error', (err) => {
			MopConsole.error('DB', 'Failed to connect');
			throw err;
		});
		DataBase.once('open', () => {
			MopConsole.info('DB', 'Connected.');
			resolve();
		});
	}),
};
