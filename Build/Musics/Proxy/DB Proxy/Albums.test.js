"use strict";
const tslib_1 = require("tslib");
require('regenerator-runtime/runtime');
const { FindAlbumContainingMusic, HandleAlbumsFromDz, } = require('./Albums');
const { connect, clearDatabase, closeDatabase, } = require('../../../Tests/DbHandler');
const { Music, Album, Artist } = require('../../Model');
beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield connect(); }));
afterEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield clearDatabase(); }));
afterAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield closeDatabase(); }));
const SampleAlbum = {
    Name: 'DAMN.',
    DeezerId: 1001,
};
const SampleMusic = {
    Title: 'HUMBLE.',
    Album: 'DAMN.',
    Artist: 'Kendrick Lamar',
    TrackNumber: 8,
    DeezerId: 350171311,
};
describe('Musics.DBProxy.Albums should work properly', () => {
    it('Should get albums of an Artist properly', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const m = yield Music.create(SampleMusic);
        SampleAlbum.MusicsId = [m._id];
        const a = yield Album.create(SampleAlbum);
        expect((yield FindAlbumContainingMusic(m))._id).toEqual(a._id);
        const m2 = yield Music.create({ Album: 'ALBUM' });
        yield Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });
        const a2 = yield Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });
        expect((yield FindAlbumContainingMusic(m2))._id).toEqual(a2._id);
    }));
    it('Should append album from deezer to an artist', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const a1 = {
            title: 'ALBUM1',
            id: 110,
        };
        const a3 = {
            title: 'ALBUM3',
            id: 100,
        };
        const A = yield Artist.create({ DeezerId: 100, AlbumsId: [] });
        yield HandleAlbumsFromDz(100, [a3, a1]);
        const newArtist = yield Artist.findById(A._id).lean();
        expect(newArtist.AlbumsId.length).toEqual(2);
    }));
});
