"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const path_1 = tslib_1.__importDefault(require("path"));
const MopConsole_1 = tslib_1.__importDefault(require("../Tools/MopConsole"));
const Config_1 = require("../Musics/Config");
const User_1 = tslib_1.__importDefault(require("./User"));
const Music_1 = tslib_1.__importDefault(require("./Music"));
const app = express_1.default();
exports.default = app;
// const compression = require('compression');
app.use((req, res, next) => {
    if (res.statusCode === 404)
        MopConsole_1.default.warn('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);
    else
        MopConsole_1.default.standard('Request.Path', `${req.url} - ${res.statusCode}`, req.ip);
    next();
});
app.use('/User', User_1.default);
app.use('/Music', Music_1.default);
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../../Public/index.html'));
});
const staticPath = path_1.default.join(__dirname, '../../Public/');
app.use(express_1.default.static(staticPath));
app.use(express_1.default.static(Config_1.MusicsFolder));
app.use(express_1.default.static(Config_1.ArtistsImageFolder));
app.use(express_1.default.static(path_1.default.join(__dirname, '../../Public/Dist')));
