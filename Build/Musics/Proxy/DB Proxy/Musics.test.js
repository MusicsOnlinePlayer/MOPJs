"use strict";
const tslib_1 = require("tslib");
require('regenerator-runtime/runtime');
const { AppendOrUpdateMusicsToAlbum, } = require('./Musics');
const { connect, clearDatabase, closeDatabase, } = require('../../../Tests/DbHandler');
const { Music, Album } = require('../../Model');
beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield connect(); }));
afterEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield clearDatabase(); }));
afterAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield closeDatabase(); }));
describe('Musics.DBProxy.Musics should work properly', () => {
    it('Should append or update music to album', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const m1 = yield Music.create({ Title: 'MUSIC1', DeezerId: 100 });
        yield Music.create({ Title: 'MUSIC2', DeezerId: 90 });
        yield Music.create({ Title: 'MUSIC3', DeezerId: 80 });
        const a1 = yield Album.create({ Name: 'ALBUM1', DeezerId: 80 });
        const MusicObject = m1.toObject();
        MusicObject.TrackNumber = 10;
        yield AppendOrUpdateMusicsToAlbum([MusicObject]);
        expect((yield Music.findById(m1._id)).TrackNumber).toEqual(MusicObject.TrackNumber);
        const MusicTags = {
            Title: 'MUSIC4',
            DeezerId: 110,
            Album: 'ALBUM1',
        };
        yield AppendOrUpdateMusicsToAlbum([MusicTags], a1.DeezerId);
        const newAlbum = yield Album.findById(a1._id);
        yield newAlbum.populate('MusicsId').execPopulate();
        expect(newAlbum.MusicsId[0].Title).toEqual(MusicTags.Title);
    }));
});
