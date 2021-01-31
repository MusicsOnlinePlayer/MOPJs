"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnsureAuth = void 0;
const tslib_1 = require("tslib");
const MopConsole_1 = tslib_1.__importDefault(require("../Tools/MopConsole"));
const MopConf_json_1 = require("../Config/MopConf.json");
// eslint-disable-next-line import/prefer-default-export
const EnsureAuth = (req, res, next) => {
    // @ts-ignore for req.isAuthenticated()
    if (req.isAuthenticated() || !MopConf_json_1.EnsureAuth) {
        return next();
    }
    MopConsole_1.default.warn('Middleware.Auth', 'User not authenticated');
    return res.sendStatus(401);
};
exports.EnsureAuth = EnsureAuth;
