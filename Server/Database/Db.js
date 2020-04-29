const mongoose = require('mongoose');
const MopConsole = require('../Tools/MopConsole');

const Url = 'mongodb://localhost:27017/MOP';

module.exports = {
	ConnectToDB: () => new Promise((resolve) => {
		MopConsole.info('DB', `Connecting to mongo database at ${Url}`);
		mongoose.connect(Url, { useNewUrlParser: true });
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
