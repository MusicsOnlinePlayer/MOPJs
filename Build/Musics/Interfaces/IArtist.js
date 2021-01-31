"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArtist = void 0;
function isArtist(obj) {
    return (obj && obj.Name && typeof obj.Name === 'string');
}
exports.isArtist = isArtist;
