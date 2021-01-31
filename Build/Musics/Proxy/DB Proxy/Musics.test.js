"use strict";
require('regenerator-runtime/runtime');
const { AppendOrUpdateMusicsToAlbum, } = require('./Musics');
const { connect, clearDatabase, closeDatabase, } = require('../../../Tests/DbHandler');
const { Music, Album } = require('../../Model');
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());
describe('Musics.DBProxy.Musics should work properly', () => {
    it('Should append or update music to album', async () => {
        const m1 = await Music.create({ Title: 'MUSIC1', DeezerId: 100 });
        await Music.create({ Title: 'MUSIC2', DeezerId: 90 });
        await Music.create({ Title: 'MUSIC3', DeezerId: 80 });
        const a1 = await Album.create({ Name: 'ALBUM1', DeezerId: 80 });
        const MusicObject = m1.toObject();
        MusicObject.TrackNumber = 10;
        await AppendOrUpdateMusicsToAlbum([MusicObject]);
        expect((await Music.findById(m1._id)).TrackNumber).toEqual(MusicObject.TrackNumber);
        const MusicTags = {
            Title: 'MUSIC4',
            DeezerId: 110,
            Album: 'ALBUM1',
        };
        await AppendOrUpdateMusicsToAlbum([MusicTags], a1.DeezerId);
        const newAlbum = await Album.findById(a1._id);
        await newAlbum.populate('MusicsId').execPopulate();
        expect(newAlbum.MusicsId[0].Title).toEqual(MusicTags.Title);
    });
});
