"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isUser(obj) {
    return (obj && obj.username && typeof obj.username === 'string');
}
exports.isUser = isUser;
