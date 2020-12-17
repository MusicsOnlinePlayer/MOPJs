"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isArtist(obj) {
    return (obj && obj.Name && typeof obj.Name === 'string');
}
exports.isArtist = isArtist;
