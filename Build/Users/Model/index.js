"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const passport_local_mongoose_1 = tslib_1.__importDefault(require("passport-local-mongoose"));
const mongoosastic_1 = tslib_1.__importDefault(require("mongoosastic"));
const MopConf_json_1 = require("../../Config/MopConf.json");
const Model_1 = require("../../Musics/Model");
const UserSchema = new mongoose_1.default.Schema({
    username: { type: String, es_indexed: 'true' },
    ViewedMusics: [{
            type: mongoose_1.default.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: Model_1.MusicSchema, es_select: 'Title Artist Album',
        }],
    LikedMusics: [{
            type: mongoose_1.default.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: Model_1.MusicSchema, es_select: 'Title Artist Album',
        }],
    CurrentPlaylist: [{
            type: mongoose_1.default.Schema.Types.ObjectId, default: [], ref: 'Music', es_indexed: true, es_schema: Model_1.MusicSchema, es_select: 'Title Artist Album',
        }],
    CurrentPlaylistPlaying: { type: Number, es_indexed: 'true', default: 0 },
});
UserSchema.plugin(mongoosastic_1.default, {
    hosts: [MopConf_json_1.EsHost],
    populate: [
        { path: 'ViewedMusics', select: 'Title Artist Album' },
        { path: 'LikedMusics', select: 'Title Artist Album' },
        { path: 'CurrentPlaylist', select: 'Title Artist Album' },
    ],
});
UserSchema.plugin(passport_local_mongoose_1.default);
// eslint-disable-next-line import/prefer-default-export
exports.User = mongoose_1.default.model('User', UserSchema, 'User');
//# sourceMappingURL=index.js.map