"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isMusic(obj) {
    return (obj && obj.Title && typeof obj.Title === 'string');
}
exports.isMusic = isMusic;
