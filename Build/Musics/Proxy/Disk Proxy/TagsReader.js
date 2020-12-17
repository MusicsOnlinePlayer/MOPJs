"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const musicmetadata_1 = tslib_1.__importDefault(require("musicmetadata"));
/** This function retrieves ID3 tags of a music
 * @param {string} filePath - File path of the music
 */
// eslint-disable-next-line import/prefer-default-export
exports.ReadTags = (filePath) => new Promise((resolve, reject) => {
    musicmetadata_1.default(fs_1.default.createReadStream(filePath), (err, meta) => {
        if (err) {
            reject(err);
            return;
        }
        resolve(meta);
    });
});
