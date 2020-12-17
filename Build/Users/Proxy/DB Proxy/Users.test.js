"use strict";
const tslib_1 = require("tslib");
require('regenerator-runtime/runtime');
const { connect, clearDatabase, closeDatabase, } = require('../../../Tests/DbHandler');
const { User } = require('../../Model');
const { GetLikedMusicsOfUser, GetViewedMusicsOfUser, CheckLikeMusic, LikeMusicOnUser, RegisterToUserHistory, GetPlaylistsIdOfUser, } = require('./Users');
const { Music, Playlist } = require('../../../Musics/Model');
beforeAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield connect(); }));
afterEach(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield clearDatabase(); }));
afterAll(() => tslib_1.__awaiter(void 0, void 0, void 0, function* () { return yield closeDatabase(); }));
describe('DB Proxy for user should work properly', () => {
    it('Should get liked musics of an user', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyMusic = {
            Title: 'MUSIC1',
        };
        const m = yield Music.create(MyMusic);
        const MyUser = {
            username: 'Malau',
            LikedMusics: [m._id],
        };
        const u = yield User.create(MyUser);
        const LikedMusics = yield GetLikedMusicsOfUser(u._id);
        expect(LikedMusics).toContainObject({ _id: m._id });
    }));
    it('Should get viewed musics of an user', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyMusic = {
            Title: 'MUSIC1',
        };
        const m = yield Music.create(MyMusic);
        const MyUser = {
            username: 'Malau',
            ViewedMusics: [m._id],
        };
        const u = yield User.create(MyUser);
        const ViewedMusics = yield GetViewedMusicsOfUser(u._id);
        expect(ViewedMusics).toContainObject({ _id: m._id });
    }));
    it('Should check if a music is liked or not', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyMusic = {
            Title: 'MUSIC1',
        };
        const m = yield Music.create(MyMusic);
        const MyUser = {
            username: 'Malau',
            LikedMusics: [m._id],
        };
        const u = yield User.create(MyUser);
        const IsLiked = yield CheckLikeMusic(m._id, u._id);
        expect(IsLiked).toEqual(true);
        yield LikeMusicOnUser(m._id, u._id);
        const IsLiked2 = yield CheckLikeMusic(m._id, u._id);
        expect(IsLiked2).toEqual(false);
    }));
    it('Should be able to like a music', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyUser = {
            username: 'Malau',
        };
        const MyMusic = {
            Title: 'MUSIC1',
        };
        const MyMusic2 = {
            Title: 'MUSIC2',
        };
        const m = yield Music.create(MyMusic);
        const m2 = yield Music.create(MyMusic2);
        const u = yield User.create(MyUser);
        yield LikeMusicOnUser(m._id, u._id);
        yield LikeMusicOnUser(m2._id, u._id);
        const newUser1 = yield User.findById(u._id).lean();
        yield Music.findById(m._id);
        yield Music.findById(m2._id);
        expect(newUser1.LikedMusics).toEqual([m._id, m2._id]);
        yield LikeMusicOnUser(m._id, u._id);
        yield LikeMusicOnUser(m2._id, u._id);
        yield Music.findById(m._id);
        yield Music.findById(m2._id);
        const newUser2 = yield User.findById(u._id).lean();
        expect(newUser2.LikedMusics).toEqual([]);
    }));
    it('Should register to user history', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyMusic = {
            Title: 'MUSIC1',
        };
        const m = yield Music.create(MyMusic);
        const MyUser = {
            username: 'Malau',
        };
        const u = yield User.create(MyUser);
        yield RegisterToUserHistory(m._id, u._id);
        const ViewedMusics = yield GetViewedMusicsOfUser(u._id);
        expect(ViewedMusics).toContainObject({ _id: m._id });
    }));
    it('Should get all playlists id of an user', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyUser = {
            username: 'Malau',
        };
        const u = yield User.create(MyUser);
        const p1 = yield Playlist.create({
            Name: 'P1',
            Creator: u._id,
        });
        const p2 = yield Playlist.create({
            Name: 'P2',
            Creator: u._id,
        });
        const PlaylistIds = yield GetPlaylistsIdOfUser(u._id, true);
        expect(PlaylistIds).toContainObject({ _id: p1._id });
        expect(PlaylistIds).toContainObject({ _id: p2._id });
    }));
    it('Should get all playlists id of an user and remove private playlists', () => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        const MyUser = {
            username: 'Malau',
        };
        const u = yield User.create(MyUser);
        const p1 = yield Playlist.create({
            Name: 'P1',
            Creator: u._id,
            IsPublic: true,
        });
        const p2 = yield Playlist.create({
            Name: 'P2',
            Creator: u._id,
            IsPublic: false,
        });
        const PlaylistIds = yield GetPlaylistsIdOfUser(u._id, false);
        expect(PlaylistIds).toContainObject({ _id: p1._id });
    }));
});
