"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicSchema = exports.PlaylistModel = exports.ArtistModel = exports.AlbumModel = exports.MusicModel = exports.esClient = void 0;
const tslib_1 = require("tslib");
const mongoose_1 = tslib_1.__importDefault(require("mongoose"));
const elasticsearch = tslib_1.__importStar(require("elasticsearch"));
const mongoosastic_1 = tslib_1.__importDefault(require("mongoosastic"));
const MopConf_json_1 = require("../../Config/MopConf.json");
// eslint-disable-next-line import/no-mutable-exports
let esClient;
exports.esClient = esClient;
if (process.env.NODE_ENV !== 'test' && !MopConf_json_1.UseMongoSearchIndex) {
    exports.esClient = esClient = new elasticsearch.Client({
        host: MopConf_json_1.EsHost,
    });
}
const MusicSchema = new mongoose_1.default.Schema({
    Title: { type: String, es_indexed: true, es_boost: 8.0 },
    Artist: { type: String, es_indexed: true, es_boost: 1.0 },
    Album: { type: String, es_indexed: true },
    AlbumId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Album' },
    PublishedDate: { type: Date, es_type: 'date', es_indexed: true },
    TrackNumber: Number,
    FilePath: String,
    DeezerId: { type: Number, index: { unique: true, sparse: true } },
    Views: { type: Number, default: 0, es_indexed: true },
    Likes: { type: Number, default: 0, es_indexed: true },
    Rank: { type: Number, default: 0, es_indexed: true },
    LastView: { type: Date, es_type: 'date', es_indexed: true },
});
exports.MusicSchema = MusicSchema;
MusicSchema.index({
    Title: 'text',
    Artist: 'text',
    Album: 'text',
}, {
    weights: {
        Title: 4,
        Artist: 2,
        Album: 1,
    },
});
const AlbumSchema = new mongoose_1.default.Schema({
    Name: { type: String, es_indexed: true },
    DeezerId: { type: Number, index: { unique: true, sparse: true } },
    Image: String,
    ImageFormat: String,
    ImagePathDeezer: String,
    IsComplete: { type: Boolean, default: false },
    MusicsId: [{
            type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Music',
        }],
});
AlbumSchema.index({ Name: 'text' });
const ArtistSchema = new mongoose_1.default.Schema({
    Name: { type: String, es_indexed: true },
    DeezerId: { type: Number, index: { unique: true, sparse: true } },
    AlbumsId: [{
            type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Album',
        }],
    ImagePath: String,
});
ArtistSchema.index({ Name: 'text' });
const PlaylistSchema = new mongoose_1.default.Schema({
    Name: { type: String, es_indexed: true },
    IsPublic: { type: Boolean, es_indexed: true },
    Creator: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    MusicsId: [{
            type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Music',
        }],
});
PlaylistSchema.index({ Name: 'text' });
if (process.env.NODE_ENV !== 'test' && !MopConf_json_1.UseMongoSearchIndex) {
    MusicSchema.plugin(mongoosastic_1.default, {
        esClient,
    });
    AlbumSchema.plugin(mongoosastic_1.default, {
        esClient,
    });
    ArtistSchema.plugin(mongoosastic_1.default, {
        esClient,
    });
    PlaylistSchema.plugin(mongoosastic_1.default, {
        esClient,
    });
}
ArtistSchema.static('findOneOrCreate', function findOneOrCreate(condition, doc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const one = yield this.findOne(condition);
        return one || (yield this.create(doc));
    });
});
AlbumSchema.static('findOneOrCreate', function findOneOrCreate(condition, doc) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        const one = yield this.findOne(condition);
        return one || (yield this.create(doc));
    });
});
exports.MusicModel = mongoose_1.default.model('Music', MusicSchema, 'Music');
exports.AlbumModel = mongoose_1.default.model('Album', AlbumSchema, 'Album');
exports.ArtistModel = mongoose_1.default.model('Artist', ArtistSchema, 'Artist');
exports.PlaylistModel = mongoose_1.default.model('Playlist', PlaylistSchema, 'Playlist');
if (process.env.NODE_ENV !== 'test' && !MopConf_json_1.UseMongoSearchIndex) {
    exports.MusicModel.synchronize();
    exports.AlbumModel.synchronize();
    exports.ArtistModel.synchronize();
    exports.PlaylistModel.synchronize();
}
