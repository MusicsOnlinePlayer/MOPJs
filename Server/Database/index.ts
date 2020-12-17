import mongoose from 'mongoose';
import MopConsole from '../Tools/MopConsole';

import { MongoUrl, EnableMongoAuth } from '../Config/MopConf.json';

// eslint-disable-next-line import/prefer-default-export
export const ConnectToDB = () : Promise<void> => new Promise((resolve) => {
	MopConsole.info('Database.Connection', `Connecting to mongo database ${MongoUrl}`);
	mongoose.connect(MongoUrl, {
		useNewUrlParser: true,
		authSource: EnableMongoAuth ? 'admin' : undefined,
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
});
