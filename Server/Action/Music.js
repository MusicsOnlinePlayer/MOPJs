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
const { FindAlbumContainingMusic } = require('../Database/MusicReader');

const HandleMusicRequestById = (id) => new Promise((resolve, reject) => {
	Music.findById(id, async (err, doc) => {
		if (err) {
			MopConsole.error('Music', err);
			reject(err);
			return;
		}
		if (!doc) {
			MopConsole.warn('Music', `Music id not found ${id}`);
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
		}
		resolve(MusicDoc);
	});
});

const HandleAlbumRequestById = (id, QueryMode) => new Promise((resolve, reject) => {
	Album.findById(id)
		.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } }, select: 'TrackNumber _id' })
		.exec(async (err, doc) => {
			if (err) {
				MopConsole.error('Music', err);
				reject(err);
				return;
			}
			if (!doc) {
				MopConsole.warn('Music', `Album id not found ${id}`);
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
					AlbumDoc = await Album.findById(id).lean();
				}
			}
			resolve(AlbumDoc);
		});
});

const HandleArtistRequestById = (id, QueryMode) => new Promise((resolve, reject) => {
	Artist.findById(id, async (err, doc) => {
		let ArtistDoc = doc;
		if (err) {
			MopConsole.error('Music', err);
			reject(err);
			return;
		}
		if (!ArtistDoc) {
			MopConsole.warn('Music', `Artist id not found ${id}`);
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


const GetMusicFilePath = (id, UserReq) => new Promise((resolve, reject) => {
	Music.findById(id, async (err, doc) => {
		if (err) {
			MopConsole.error('Music', err);
			reject(err);
			return;
		}
		if (!doc) {
			MopConsole.warn('Music', `Music id not found ${id}`);
			resolve({});
			return;
		}
		const MusicDoc = doc;
		MusicDoc.Views += 1;
		MusicDoc.LastView = Date.now();
		MusicDoc.save();
		if (UserReq) {
			User.findById(UserReq._id, (Usererr, Userdoc) => {
				if (Usererr) {
					MopConsole.error('Music - User - History', Usererr);
					return;
				}
				Userdoc.ViewedMusics.push(MusicDoc._id);
				Userdoc.save();
				MopConsole.info('Musics', 'Saved to user history');
			});
		}
		if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
			resolve({ FilePath: MusicDoc.FilePath ? path.basename(MusicDoc.FilePath) : '' });
			return;
		}

		resolve({ FilePath: await Downloader.AddToQueueAsync(MusicDoc.DeezerId) });
	});
});

module.exports = {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
	GetMusicFilePath,
};
