const path = require('path');
const { Music, Album, Artist } = require('../Model');
const MopConsole = require('../../Tools/MopConsole');
const { FindAlbumContainingMusic, HandleNewMusicFromDisk, HandleNewMusicFromDz } = require('../Proxy/DB Proxy');
const { CompleteAlbum, CompleteArtist, GetMusicFilePath } = require('./DeezerHandler');
const { GetImageOfArtist } = require('../Proxy/Deezer Proxy');
const { RegisterToUserHistory, CheckIfMusicIsLikedByUserReq } = require('../../Users/Handler');
const { ReadTagsFromDisk, GetMusicsFiles } = require('../Proxy/Disk Proxy');

const Location = 'Musics.Handler.DBHandler';


module.exports = {
	MakeIndexation: async () => {
		MopConsole.info(Location, 'Starting indexing');
		MopConsole.time(Location, 'Time ');
		const files = GetMusicsFiles();
		/* eslint no-restricted-syntax: "off" */
		for (const file of files) {
			let tags;
			try {
				tags = await ReadTagsFromDisk(file);
			} catch (err) {
				MopConsole.warn(Location, `Cannot read tags of music file ${file}`);
			}

			if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
				await HandleNewMusicFromDisk(tags, file);
			} else {
				MopConsole.warn(Location, `Skipped ${file} (Missing tags)`);
			}
		}


		MopConsole.info(Location, `Done - ${files.length} musics on the disk`);
		MopConsole.timeEnd(Location, 'Time ');
	},


	HandleMusicRequestById: (id, UserReq) => new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Searching for music with db id ${id}`);
		Music.findById(id, async (err, doc) => {
			if (err) {
				MopConsole.error(Location, err);
				reject(err);
				return;
			}
			if (!doc) {
				MopConsole.warn(Location, `Music id not found ${id}`);
				resolve({});
				return;
			}
			const MusicDoc = doc.toObject();
			if (MusicDoc) {
				MopConsole.debug(Location, `Found music with title ${MusicDoc.Title}`);
				MusicDoc.FilePath = MusicDoc.FilePath
					? path.basename(MusicDoc.FilePath) : undefined;
				const AlbumOfMusic = await FindAlbumContainingMusic(MusicDoc);
				//! Should search by dz id
				MusicDoc.Image = AlbumOfMusic.Image;
				MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
				MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
				if (UserReq) MusicDoc.IsLiked = await CheckIfMusicIsLikedByUserReq(UserReq, MusicDoc._id);
			}
			resolve(MusicDoc);
		});
	}),
	HandleAlbumRequestById: (id, QueryMode) => new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Searching for album with db id ${id} - query mode ${QueryMode}`);
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
				MopConsole.debug(Location, `Found album named ${AlbumDoc.Name}`);
				AlbumDoc.MusicsId = AlbumDoc.MusicsId.map((obj) => obj._id);
				if (AlbumDoc.DeezerId) {
					if (!AlbumDoc.IsComplete && QueryMode === 'all') {
						MopConsole.debug(Location, `It is an incomplete deezer album, requesting all musics of the album (query mode: ${QueryMode} )`);

						await CompleteAlbum(AlbumDoc);

						const newAlbum = await Album.findById(id);
						await newAlbum.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } }, select: 'TrackNumber _id' })
							.execPopulate();

						AlbumDoc = await newAlbum.toObject();
						AlbumDoc.MusicsId = AlbumDoc.MusicsId.map((obj) => obj._id);
					}
				}
				resolve(AlbumDoc);
			});
	}),
	HandleArtistRequestById: (id, QueryMode) => new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Searching for artist with db id ${id} - query mode ${QueryMode}`);
		Artist.findById(id, async (err, doc) => {
			let ArtistDoc = doc;
			if (err) {
				MopConsole.error(Location, err);
				reject(err);
				return;
			}
			if (!ArtistDoc) {
				MopConsole.warn(Location, `Artist id not found ${id}`);
				resolve({});
				return;
			}
			MopConsole.debug(Location, `Found artist named ${ArtistDoc.Name}`);
			if (ArtistDoc.DeezerId) {
				if (QueryMode === 'all') {
					await CompleteArtist(ArtistDoc);
					ArtistDoc = await Artist.findById(id);
				}
				if (!ArtistDoc.ImagePath) {
					ArtistDoc.ImagePath = await GetImageOfArtist(ArtistDoc.DeezerId);
					ArtistDoc.save();
				}
			}
			resolve(ArtistDoc);
		});
	}),
	GetMusicFilePath: (id, UserReq, RegisterHistory = true) => new Promise((resolve, reject) => {
		MopConsole.debug(Location, `Getting music file path, db id: ${id} RegisterHistory is set to ${RegisterHistory}`);
		Music.findById(id, async (err, doc) => {
			if (err) {
				MopConsole.error(Location, err);
				reject(err);
				return;
			}
			if (!doc) {
				MopConsole.warn(Location, `Music id not found ${id}`);
				resolve({});
				return;
			}
			const MusicDoc = doc;
			if (RegisterHistory) {
				MusicDoc.Views += 1;
				MusicDoc.LastView = Date.now();
				await MusicDoc.save();
			}

			if (UserReq && RegisterHistory) {
				await RegisterToUserHistory(MusicDoc._id, UserReq._id);
			}
			if (!MusicDoc.DeezerId || MusicDoc.FilePath) {
				MopConsole.debug(Location, `Music file path for db id ${id} is ${MusicDoc.FilePath}`);
				resolve({ FilePath: MusicDoc.FilePath ? path.basename(MusicDoc.FilePath) : '' });
				return;
			}

			MopConsole.debug(Location, `Music file path for db id ${id} is not present, downloading using DzDownloader`);
			await GetMusicFilePath(MusicDoc.DeezerId);
			Music.findById(id, (_err, newMusic) => resolve({ FilePath: newMusic.FilePath ? path.basename(newMusic.FilePath) : '' }));
		});
	}),
	IncrementLikeCount: async (id, increment = 1) => {
		const music = await Music.findById(id);
		music.Likes += increment;
		music.save();
		MopConsole.debug(Location, `Increased like count of music ${id} by ${increment}`);
	},
	AddMusicsFromDeezer: async (tags) => {
		for (const musicTags of tags) {
			await HandleNewMusicFromDz(musicTags);
		}
	},
};
