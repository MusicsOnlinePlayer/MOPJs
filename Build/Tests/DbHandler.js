"use strict";
const tslib_1 = require("tslib");
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
module.exports.connect = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const uri = yield mongod.getConnectionString();
    const mongooseOpts = {
        useNewUrlParser: true,
        autoReconnect: true,
        reconnectTries: Number.MAX_VALUE,
        reconnectInterval: 1000,
        poolSize: 10,
    };
    yield mongoose.connect(uri, mongooseOpts);
});
/**
 * Drop database, close the connection and stop mongod.
 */
module.exports.closeDatabase = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield mongoose.connection.dropDatabase();
    yield mongoose.connection.close();
    yield mongod.stop();
});
/**
 * Remove all the data for all db collections.
 */
module.exports.clearDatabase = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    const { collections } = mongoose.connection;
    for (const key in collections) {
        const collection = collections[key];
        yield collection.deleteMany();
    }
});
//# sourceMappingURL=DbHandler.js.map