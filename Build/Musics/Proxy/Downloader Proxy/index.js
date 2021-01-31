"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDownloaderUser = void 0;
const tslib_1 = require("tslib");
/* eslint-disable import/prefer-default-export */
const dzdownloadernode_1 = require("@mopjs/dzdownloadernode");
let MyUser;
const GetDownloaderUser = () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (MyUser || process.env.NODE_ENV === 'test') {
        return MyUser;
    }
    MyUser = yield dzdownloadernode_1.CreateUser(process.env.MOP_DEEZER_ARL);
    return MyUser;
});
exports.GetDownloaderUser = GetDownloaderUser;
