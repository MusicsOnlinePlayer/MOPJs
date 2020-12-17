"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const passport_1 = tslib_1.__importDefault(require("passport"));
const mongodb_1 = require("mongodb");
const MopConsole_1 = tslib_1.__importDefault(require("../Tools/MopConsole"));
const EnsureAuthentication_1 = require("../Auth/EnsureAuthentication");
const Handler_1 = require("../Users/Handler");
const app = express_1.default();
exports.default = app;
app.post('/Login', passport_1.default.authenticate('local'), (req, res) => {
    res.send({ success: true });
    MopConsole_1.default.info('Route.User', 'User logged in');
});
app.post('/Register', (req, res) => tslib_1.__awaiter(void 0, void 0, void 0, function* () {
    if (!req.body.name) {
        res.send({ success: false });
    }
    if (!req.body.password) {
        res.send({ success: false });
    }
    Handler_1.RegisterUser(req.body.name, req.body.password)
        .then((newUser) => {
        req.logIn(newUser, (err) => {
            if (err) {
                MopConsole_1.default.error('Route.User', err.message);
                res.send({ success: false });
            }
            res.send({ success: true });
        });
    })
        .catch(() => res.send({ success: false }));
    // const { user } = await User.authenticate()(req.body.username, req.body.password);
}));
app.get('/Me', (req, res) => {
    if (req.user) {
        res.send({ Account: req.user });
    }
    else {
        res.sendStatus(200);
    }
});
app.get('/LikedMusics', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.GetLikedMusicsOfUser(req.user._id, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((musics) => res.send(musics));
});
app.get('/ViewedMusics', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.GetViewedMusicsOfUser(req.user._id, parseInt(req.query.Page, 10), parseInt(req.query.PerPage, 10))
        .then((musics) => res.send(musics));
});
app.get('/:id/Playlists', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.GetPlaylistsOfUser(new mongodb_1.ObjectId(req.params.id), req.user._id.toString() === req.params.id.toString())
        .then((Playlists) => res.send(Playlists))
        .catch(() => res.sendStatus(300));
});
app.get('/Playlists', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.GetPlaylistsOfUser(req.user._id, true)
        .then((Playlists) => res.send(Playlists))
        .catch(() => res.sendStatus(300));
});
app.get('/CurrentPlaylist', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.GetCurrentPlaylistOfUser(req.user._id)
        .then((CurrentPlaylist) => res.send(CurrentPlaylist))
        .catch(() => res.sendStatus(300));
});
app.post('/CurrentPlaylist/Musics', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.SetCurrentPlaylistOfUser(req.user._id, req.body.CurrentPlaylist)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(300));
});
app.post('/CurrentPlaylist/Playing', EnsureAuthentication_1.EnsureAuth, (req, res) => {
    Handler_1.SetCurrentPlaylistPlayingOfUser(req.user._id, req.body.CurrentPlaylistPlaying)
        .then(() => res.sendStatus(200))
        .catch(() => res.sendStatus(300));
});
app.get('/Logout', (req, res) => {
    req.logout();
    res.sendStatus(200);
    MopConsole_1.default.info('Route.User', 'User logged out');
});
