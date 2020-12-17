"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectToDB = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const MopConsole_1 = tslib_1.__importDefault(require("../Tools/MopConsole"));
const MopConf_json_1 = require("../Config/MopConf.json");
// eslint-disable-next-line import/prefer-default-export
const ConnectToDB = () => new Promise((resolve) => {
    MopConsole_1.default.info('Database.Connection', `Connecting to mongo database ${MopConf_json_1.MongoUrl}`);
    mongoose_1.default.connect(MopConf_json_1.MongoUrl, {
        useNewUrlParser: true,
        authSource: MopConf_json_1.EnableMongoAuth ? 'admin' : undefined,
    });
    const DataBase = mongoose_1.default.connection;
    DataBase.on('error', (err) => {
        MopConsole_1.default.error('Database.Connection', 'Failed to connect');
        throw err;
    });
    DataBase.once('open', () => {
        MopConsole_1.default.info('Database.Connection', 'Connected.');
        resolve();
    });
});
exports.ConnectToDB = ConnectToDB;
//# sourceMappingURL=index.js.map