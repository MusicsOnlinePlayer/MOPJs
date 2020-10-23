const mongoose = require('mongoose');
const MopConsole = require('../Tools/MopConsole');

const { MongoUrl, EnableMongoAuth } = require('../Config/MopConf.json');

module.exports = {
	ConnectToDB: () => new Promise((resolve) => {
		MopConsole.info('Database.Connection', `Connecting to mongo database ${MongoUrl}`);
		const authArgs = { authSource: 'admin' };
		mongoose.connect(MongoUrl, {
			useNewUrlParser: true,
			auth: EnableMongoAuth ? authArgs : undefined,
		});
		const DataBase = mongoose.connection;
		DataBase.on('error', (err) => {
			MopConsole.error('Database.Connection', 'Failed to connect');
			throw err;
		});
		DataBase.once('open', () => {
			MopConsole.info('Database.Connection', 'Connected.');
			resolve();
		});
	}),
};
