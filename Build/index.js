"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/* eslint-disable import/first */
const dotenv = require('dotenv');
dotenv.config();
process.on('uncaughtException', (exception) => {
    console.error(exception);
});
process.on('unhandledRejection', (reason) => {
    console.error(reason);
});
const express_1 = tslib_1.__importDefault(require("express"));
const express_session_1 = tslib_1.__importDefault(require("express-session"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const passport_1 = require("passport");
const body_parser_1 = require("body-parser");
const compression_1 = tslib_1.__importDefault(require("compression"));
const mongoose_1 = require("mongoose");
const connect_mongo_1 = tslib_1.__importDefault(require("connect-mongo"));
const Model_1 = require("./Users/Model");
const MopConf_json_1 = require("./Config/MopConf.json");
const Handler_1 = require("./Musics/Handler");
const Database_1 = require("./Database");
const app = express_1.default();
const MongoStore = connect_mongo_1.default(express_session_1.default);
// app.use(compression);
Database_1.ConnectToDB().then(() => {
    Handler_1.MakeIndexation();
    app.use(cookie_parser_1.default());
    app.use(body_parser_1.json());
    app.use(body_parser_1.urlencoded({
        extended: true,
    }));
    app.use(express_session_1.default({
        secret: 'zuehfzgbvchbsgvrcghuzebcrvgvzgervf',
        resave: false,
        saveUninitialized: true,
        store: new MongoStore({ mongooseConnection: mongoose_1.connection }),
    }));
    passport_1.use(Model_1.User.createStrategy());
    passport_1.serializeUser(Model_1.User.serializeUser());
    passport_1.deserializeUser(Model_1.User.deserializeUser());
    app.use(passport_1.initialize());
    app.use(passport_1.session());
    if (process.env.NODE_ENV === 'production')
        app.use(compression_1.default());
    app.use(require('./Routes/index').default);
    app.listen(MopConf_json_1.MopPort);
});
//# sourceMappingURL=index.js.map