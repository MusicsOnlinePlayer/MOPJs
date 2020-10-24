const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

expect.extend({
	toContainObject(received, argument) {
		const pass = this.equals(received, expect.arrayContaining([expect.objectContaining(argument)]));

		if (pass) {
			return {
				message: () => `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`,
				pass: true,
			};
		}
		return {
			message: () => `expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`,
			pass: false,
		};
	},
});

/**
 * Connect to the in-memory database.
 */
module.exports.connect = async () => {
	const uri = await mongod.getConnectionString();

	const mongooseOpts = {
		useNewUrlParser: true,
		autoReconnect: true,
		reconnectTries: Number.MAX_VALUE,
		reconnectInterval: 1000,
		poolSize: 10,
	};

	await mongoose.connect(uri, mongooseOpts);
};

/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = async () => {
	await mongoose.connection.dropDatabase();
	await mongoose.connection.close();
	await mongod.stop();
};

/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = async () => {
	const { collections } = mongoose.connection;

	for (const key in collections) {
		const collection = collections[key];
		await collection.deleteMany();
	}
};
