"use strict";
const tslib_1 = require("tslib");
require('regenerator-runtime/runtime');
const { connect, clearDatabase, closeDatabase, } = require('../../../Tests/DbHandler');
const { Music, Playlist } = require('../../Model');
const { CreatePlaylist } = require('./Playlist');
const { User } = require('../../../Users/Model');
beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield connect(); }));
afterEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield clearDatabase(); }));
afterAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield closeDatabase(); }));
describe('Musics.DBProxy.Playlist should work properly', () => {
    it('Should be able to create a playlist', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const m1 = yield Music.create({ Title: 'MUSIC1', DeezerId: 100 });
        const m2 = yield Music.create({ Title: 'MUSIC2', DeezerId: 90 });
        const m3 = yield Music.create({ Title: 'MUSIC3', DeezerId: 80 });
        const u1 = yield User.create({ username: 'MALAURY' });
        const p1 = yield CreatePlaylist('PLAYLIST1', [m1._id, m2._id, m3._id], u1._id, true);
        const FoundPlaylist = yield Playlist.findById(p1._id).populate('Creator MusicsId');
        expect(FoundPlaylist.Name).toBe('PLAYLIST1');
        expect(FoundPlaylist.Creator.username).toBe('MALAURY');
        expect(FoundPlaylist.Creator._id).toStrictEqual(u1._id);
        expect(FoundPlaylist.MusicsId[0].Title).toBe('MUSIC1');
        expect(FoundPlaylist.IsPublic).toBe(true);
    }));
});
