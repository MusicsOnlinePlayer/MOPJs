"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isAlbum(obj) {
    return (obj && obj.Name && typeof obj.Name === 'string');
}
exports.isAlbum = isAlbum;
