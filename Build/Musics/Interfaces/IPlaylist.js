"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isPlaylist(obj) {
    return (obj && obj.Title && typeof obj.Title === 'string');
}
exports.isPlaylist = isPlaylist;
