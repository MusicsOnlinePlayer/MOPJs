const mongoose = require('mongoose');

const Url = 'mongodb://localhost:27017/MOP';

module.exports = {
	ConnectToDB: () => new Promise((resolve) => {
		console.log(`[DB] Connecting to mongo database at ${Url}`);
		mongoose.connect(Url, { useNewUrlParser: true });
		const DataBase = mongoose.connection;
		DataBase.on('error', (err) => {
			console.error('[DB] Failed to connect');
			throw err;
		});
		DataBase.once('open', () => {
			console.log('[DB] Connected.');
			resolve();
		});
	}),
};