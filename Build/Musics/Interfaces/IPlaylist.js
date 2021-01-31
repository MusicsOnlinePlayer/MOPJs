"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlaylist = void 0;
function isPlaylist(obj) {
    return (obj && obj.Title && typeof obj.Title === 'string');
}
exports.isPlaylist = isPlaylist;
