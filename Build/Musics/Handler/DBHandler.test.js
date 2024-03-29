"use strict";
require('regenerator-runtime/runtime');
const path = require('path');
const { HandleMusicRequestById, HandleAlbumRequestById, HandleArtistRequestById, GetMusicFilePath, IncrementLikeCount, } = require('./DBHandler');
const { connect, clearDatabase, closeDatabase, } = require('../../Tests/DbHandler');
const { Music, Album, Artist, Playlist, } = require('../Model');
const { User } = require('../../Users/Model');
const { RemovePlaylistById } = require('.');
beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());
const SampleArtist = {
    Name: 'Kendrick Lamar',
    DeezerId: 1000,
};
const SampleAlbum = {
    Name: 'DAMN.',
    DeezerId: 1001,
    IsComplete: true,
    ImagePathDeezer: 'https://e-cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/500x500-000000-80-0-0.jpg',
};
const SampleMusic = {
    Title: 'HUMBLE.',
    Album: 'DAMN.',
    Artist: 'Kendrick Lamar',
    TrackNumber: 8,
    DeezerId: 350171311,
    FilePath: 'C:\\MusicsFakeFolder\\humble.mp3',
    Likes: 0,
};
describe('Musics.Handler.DBHandler should work properly', () => {
    it('Should get a music by a db id, and gather additional important info about the music requested', async () => {
        const m1 = await Music.create({
            Title: 'HUMBLE.',
            Album: 'DAMN.',
            Artist: 'Kendrick Lamar',
            TrackNumber: 8,
            DeezerId: 350171311,
            FilePath: 'humble.mp3',
            Likes: 0,
        });
        await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });
        expect.assertions(2);
        await HandleMusicRequestById('5ec5a5e79e29336824be64a5').catch((e) => expect(e instanceof Error).toBe(true));
        const FoundMusic = await HandleMusicRequestById(m1._id);
        expect(FoundMusic).toMatchObject({
            Title: 'HUMBLE.',
            Album: 'DAMN.',
            Artist: 'Kendrick Lamar',
            TrackNumber: 8,
            DeezerId: 350171311,
            FilePath: 'humble.mp3',
            ImagePathDeezer: SampleAlbum.ImagePathDeezer,
        });
    });
    it('Should get an album by a db id, and gather ids of musics in it', async () => {
        const m1 = await Music.create(SampleMusic);
        const a1 = await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });
        expect.assertions(3);
        await HandleAlbumRequestById('5ec5a5e79e29336824be64a5').catch((e) => expect(e instanceof Error).toBe(true));
        const FoundAlbum = await HandleAlbumRequestById(a1._id);
        expect(FoundAlbum).toMatchObject({
            Name: 'DAMN.',
            DeezerId: 1001,
            IsComplete: true,
            ImagePathDeezer: SampleAlbum.ImagePathDeezer,
        });
        expect(FoundAlbum.MusicsId).toContainObject({ _id: m1._id });
    });
    it('Should get an artist by a db id and all his albums', async () => {
        const m1 = await Music.create(SampleMusic);
        const a1 = await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });
        const ar1 = await Artist.create({ ...SampleArtist, DeezerId: undefined, AlbumsId: [a1._id] });
        expect.assertions(3);
        await HandleArtistRequestById('5ec5a5e79e29336824be64a5').catch((e) => expect(e instanceof Error).toBe(true));
        const FoundArtist = await HandleArtistRequestById(ar1._id);
        expect(FoundArtist).toMatchObject({ Name: SampleArtist.Name });
        expect(FoundArtist.AlbumsId).toContainObject({ _id: a1._id });
    });
    it('should handle a filepath request without a user specified', async () => {
        const m1 = await Music.create(SampleMusic);
        const { FilePath } = await GetMusicFilePath(m1._id, undefined, false);
        expect(FilePath).toBe(path.basename(SampleMusic.FilePath));
        const FoundMusic = await Music.findById(m1._id);
        expect(FoundMusic.Views).toBe(0);
    });
    it('should handle a filepath request with a user specified', async () => {
        const m1 = await Music.create(SampleMusic);
        const u1 = await User.create({ username: 'Malau' });
        const { FilePath } = await GetMusicFilePath(m1._id, u1, true);
        expect(FilePath).toBe(path.basename(SampleMusic.FilePath));
        const FoundMusic = await Music.findById(m1._id);
        expect(FoundMusic.Views).toBe(1);
        const FoundUser = await User.findById(u1._id);
        expect(FoundUser.ViewedMusics).toContainEqual(m1._id);
    });
    it('Should increment like count', async () => {
        const m1 = await Music.create(SampleMusic);
        await IncrementLikeCount(m1._id, 1);
        const IncrementedMusic = await Music.findById(m1._id);
        expect(IncrementedMusic.Likes).toBe(1);
    });
    it('Should remove a playlist', async () => {
        const p1 = await Playlist.create({
            Name: 'PLAYLIST',
        });
        const pCountBefore = await Playlist.count({});
        expect(pCountBefore).toBe(1);
        await RemovePlaylistById(p1._id);
        const pCountAfter = await Playlist.count({});
        expect(pCountAfter).toBe(0);
    });
});
