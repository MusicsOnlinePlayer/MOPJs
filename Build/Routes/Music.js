"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const send_seekable_1 = tslib_1.__importDefault(require("send-seekable"));
const mongodb_1 = require("mongodb");
const EnsureAuthentication_1 = require("../Auth/EnsureAuthentication");
const Search_Proxy_1 = tslib_1.__importDefault(require("../Musics/Proxy/Search Proxy"));
const Handler_1 = require("../Musics/Handler");
const Config_1 = require("../Musics/Config");
const Handler_2 = require("../Users/Handler");
const MopConsole_1 = tslib_1.__importDefault(require("../Tools/MopConsole"));
const Interfaces_1 = require("../Users/Model/Interfaces");
const app = express_1.default();
exports.default = app;
app.get('/Search/Music/Name/:name', EnsureAuthentication_1.EnsureAuth, (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    yield Handler_1.SearchAndAddMusicsDeezer(req.params.name);
    Search_Proxy_1.default.SearchMusics(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((searchResult) => res.send(searchResult))
        .catch(() => res.send({}));
}));
app.get('/Search/Album/Name/:name', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Search_Proxy_1.default.SearchAlbums(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((searchResult) => res.send(searchResult))
        .catch(() => res.send({}));
});
app.get('/Search/Artist/Name/:name', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Search_Proxy_1.default.SearchArtists(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((searchResult) => res.send(searchResult))
        .catch(() => res.send({}));
});
app.get('/Search/Playlist/Name/:name', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Search_Proxy_1.default.SearchPlaylists(req.params.name, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((searchResult) => res.send(searchResult))
        .catch(() => res.send({}));
});
app.get('/Music/id/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.HandleMusicRequestById(new mongodb_1.ObjectId(req.params.id), req.user)
        .then((Music) => res.send(Music))
        .catch(() => res.send({}));
});
app.get('/Album/id/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.HandleAlbumRequestById(new mongodb_1.ObjectId(req.params.id))
        .then((Album) => res.send(Album))
        .catch(() => res.send({}));
});
app.get('/Artist/id/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.HandleArtistRequestById(new mongodb_1.ObjectId(req.params.id))
        .then((Artist) => res.send(Artist))
        .catch(() => res.send({}));
});
app.get('/cdn/:id', send_seekable_1.default, (req, res) => {
    Handler_1.GetMusicFilePath(new mongodb_1.ObjectId(req.params.id), req.user, true)
        .then((result) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
        if (result.FilePath) {
            res.sendFile(result.FilePath, { root: Config_1.MusicsFolder });
        }
        else {
            const { TotalLength, StreamingCache } = yield Handler_1.GetMusicStream(result.DeezerId);
            console.log(TotalLength);
            res.sendSeekable(StreamingCache, {
                type: 'audio/mpeg',
                length: TotalLength,
            });
        }
    }))
        .catch((err) => res.send(err));
});
app.get('/Music/Like/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_2.LikeMusicOnUser(req.user._id, new mongodb_1.ObjectId(req.params.id))
        .then((IsNowLiked) => {
        Handler_1.IncrementLikeCount(new mongodb_1.ObjectId(req.params.id), IsNowLiked ? 1 : -1);
        res.sendStatus(200);
    })
        .catch(() => res.sendStatus(300));
});
app.get('/Playlist/id/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.HandlePlaylistRequestById(new mongodb_1.ObjectId(req.params.id))
        .then((doc) => {
        const creator = Interfaces_1.isUser(doc.Creator) ? doc.Creator : undefined;
        const IsCreator = creator._id.toString() === req.user._id.toString();
        if (doc.IsPublic || IsCreator) {
            res.send(Object.assign(Object.assign({}, doc), { HasControl: IsCreator }));
        }
        res.sendStatus(401);
    })
        .catch(() => res.sendStatus(300));
});
app.delete('/Playlist/id/:id', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.HandlePlaylistRequestById(new mongodb_1.ObjectId(req.params.id))
        .then((doc) => {
        const creator = Interfaces_1.isUser(doc.Creator) ? doc.Creator : undefined;
        if (creator._id.toString() === req.user._id.toString()) {
            Handler_1.RemovePlaylistById(doc._id)
                .then(() => res.sendStatus(200))
                .catch(() => res.sendStatus(300));
            return;
        }
        res.sendStatus(401);
    })
        .catch(() => res.sendStatus(300));
});
app.post('/Playlist/Create/Deezer', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    if (req.body.Name && req.body.DeezerId && req.body.IsPublic !== undefined) {
        Handler_1.ConstructPlaylistFromDz(req.body.DeezerId, req.body.Name, req.user._id, req.body.IsPublic)
            .then((pId) => res.send({ CreatedPlaylistId: pId }))
            .catch(() => res.sendStatus(300));
    }
    else {
        res.sendStatus(422);
    }
});
app.post('/Playlist/Create/', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    if (req.body.Name && req.body.MusicsId && req.body.IsPublic !== undefined) {
        Handler_1.CreatePlaylist(req.body.Name, req.body.MusicsId, req.user._id, req.body.IsPublic)
            .then((pId) => res.send({ CreatedPlaylistId: pId }))
            .catch(() => res.sendStatus(300));
    }
    else {
        res.sendStatus(422);
    }
});
app.post('/Playlist/id/:id/Add/', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    if (Array.isArray(req.body.MusicsId)) {
        Handler_1.HandlePlaylistRequestById(new mongodb_1.ObjectId(req.params.id))
            .then((doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const creator = Interfaces_1.isUser(doc.Creator) ? doc.Creator : undefined;
            const IsCreator = creator._id.toString() === req.user._id.toString();
            if (IsCreator) {
                Handler_1.AddMusicsToPlaylist(doc._id, req.body.MusicsId)
                    .then(() => res.sendStatus(200))
                    .catch(() => res.sendStatus(300));
            }
            else {
                res.sendStatus(401);
            }
        }))
            .catch((err) => {
            MopConsole_1.default.warn('Routes.Music', err);
            res.sendStatus(300);
        });
    }
    else {
        res.sendStatus(422);
    }
});
// TODO Delete music by playlist index rather than by id
app.delete('/Playlist/id/:id/Remove/', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    if (req.body.MusicId) {
        Handler_1.HandlePlaylistRequestById(new mongodb_1.ObjectId(req.params.id))
            .then((doc) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
            const creator = Interfaces_1.isUser(doc.Creator) ? doc.Creator : undefined;
            const IsCreator = creator._id.toString() === req.user._id.toString();
            if (IsCreator) {
                Handler_1.RemoveMusicOfPlaylist(doc._id, req.body.MusicId)
                    .then(() => res.sendStatus(200))
                    .catch(() => res.sendStatus(300));
            }
            else {
                res.sendStatus(401);
            }
        }))
            .catch((err) => {
            MopConsole_1.default.warn('Routes.Music', err);
            res.sendStatus(300);
        });
    }
    else {
        res.sendStatus(422);
    }
});
//# sourceMappingURL=Music.js.map