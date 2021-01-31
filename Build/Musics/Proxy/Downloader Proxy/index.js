"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetDownloaderUser = void 0;
/* eslint-disable import/prefer-default-export */
const dzdownloadernode_1 = require("@mopjs/dzdownloadernode");
let MyUser;
const GetDownloaderUser = async () => {
    if (MyUser || process.env.NODE_ENV === 'test') {
        return MyUser;
    }
    MyUser = await dzdownloadernode_1.CreateUser(process.env.MOP_DEEZER_ARL);
    return MyUser;
};
exports.GetDownloaderUser = GetDownloaderUser;
