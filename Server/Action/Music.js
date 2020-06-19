const path = require('path');
const MopConsole = require('../Tools/MopConsole');
const {
	Music, Album, Artist, User,
} = require('../Database/Models');
const { Downloader } = require('../Deezer/Downloader');
const {
	AddMusicOfAlbumToDb,
	AddCoverOfAlbumToDb,
	AddImageOfArtistToDb,
	AddAlbumOfArtistToDb,
} = require('../Deezer');
const { FindAlbumContainingMusic, LikeMusic, CheckLikeMusic } = require('../Database/MusicReader');

const HandleMusicRequestById = (id, UserReq) => new Promise((resolve, reject) => {
	Music.findById(id, async (err, doc) => {
		if (err) {
			MopConsole.error('Action.Music', err);
			reject(err);
			return;
		}
		if (!doc) {
			MopConsole.warn('Action.Music', `Music id not found ${id}`);
			resolve({});
			return;
		}
		const MusicDoc = doc.toObject();
		if (MusicDoc) {
			MusicDoc.FilePath = MusicDoc.FilePath
				? path.basename(MusicDoc.FilePath) : undefined;
			const AlbumOfMusic = await FindAlbumContainingMusic(MusicDoc);
			//! Should search by dz id
			MusicDoc.Image = AlbumOfMusic.Image;
			MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
			MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
			if (UserReq) MusicDoc.IsLiked = await CheckLikeMusic(MusicDoc._id, UserReq._id);
		}
		resolve(MusicDoc);
	});
});

const HandleAlbumRequestById = (id, QueryMode) => new Promise((resolve, reject) => {
	Album.findById(id)
		.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } }, select: 'TrackNumber _id' })
		.exec(async (err, doc) => {
			if (err) {
				MopConsole.error('Action.Album', err);
				reject(err);
				return;
			}
			if (!doc) {
				MopConsole.warn('Action.Album', `Album id not found ${id}`);
				resolve({});
				return;
			}
			let AlbumDoc = doc.toObject();
			AlbumDoc.MusicsId = AlbumDoc.MusicsId.map((obj) => obj._id);
			if (AlbumDoc.DeezerId) {
				if (!AlbumDoc.IsComplete && QueryMode === 'all') {
					await AddMusicOfAlbumToDb(
						AlbumDoc.DeezerId,
						AlbumDoc.Name,
						AlbumDoc.ImagePathDeezer || await AddCoverOfAlbumToDb(AlbumDoc.DeezerId),
					);
					const newAlbum = await Album.findById(id);
					await newAlbum.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } }, select: 'TrackNumber _id' })
						.execPopulate();

					AlbumDoc = await newAlbum.toObject();
					AlbumDoc.MusicsId = AlbumDoc.MusicsId.map((obj) => obj._id);
				}
			}
			resolve(AlbumDoc);
		});
});

const HandleArtistRequestById = (id, QueryMode) => new Promise((resolve, reject) => {
	Artist.findById(id, async (err, doc) => {
		let ArtistDoc = doc;
		if (err) {
			MopConsole.error('Action.Artist', err);
			reject(err);
			return;
		}
		if (!ArtistDoc) {
			MopConsole.warn('Action.Artist', `Artist id not found ${id}`);
			resolve({});
			return;
		}
		if (ArtistDoc.DeezerId) {
			if (!ArtistDoc.ImagePath) {
				ArtistDoc.ImagePath = await AddImageOfArtistToDb(ArtistDoc.DeezerId);
			}
			if (QueryMode === 'all') {
				await AddAlbumOfArtistToDb(ArtistDoc.DeezerId);
				ArtistDoc = await Artist.findById(id);
			}
		}
		resolve(ArtistDoc);
	});
});


const GetMusicFilePath = (id, UserReq, RegisterHistory = true) => new Promise((resolve, reject) => {
	Music.findById(id, async (err, doc) => {
		if (err) {
			MopConsole.error('Action.Music', err);
			reject(err);
			return;
		}
		if (!doc) {
			MopConsole.warn('Action.Music', `Music id not found ${id}`);
			resolve({});
			return;
		}
		const MusicDoc = doc;
		if (RegisterHistory) {
			MusicDoc.Views += 1;
			MusicDoc.LastView = Date.now();
			MusicDoc.save();
		}

		if (UserReq && RegisterHistory) {
			User.findById(UserReq._id, (UserErr, UserDoc) => {
				if (UserErr) {
					MopConsole.error('Action.User.History', UserErr);
					return;
				}
				UserDoc.ViewedMusics.push(MusicDoc._id);
				UserDoc.save();
				MopConsole.info('Action.User.History', 'Saved to user history');
			});
		}
		if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
			resolve({ FilePath: MusicDoc.FilePath ? path.basename(MusicDoc.FilePath) : '' });
			return;
		}

		resolve({ FilePath: await Downloader.AddToQueueAsync(MusicDoc.DeezerId) });
	});
});

const HandleLikeMusic = (UserReq, MusicId) => new Promise((resolve, reject) => {
	if (!UserReq) reject();
	// TODO validate music id
	LikeMusic(MusicId, UserReq._id)
		.then(() => resolve());
});

module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
	HandleLikeMusic,
};
