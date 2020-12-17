import path from 'path';
import { ObjectId } from 'mongodb';
import {
	Music, Album, Artist, Playlist,
} from '../Model';
import MopConsole from '../../Tools/MopConsole';
import { FindAlbumContainingMusic, HandleNewMusicFromDisk, HandleNewMusicFromDz } from '../Proxy/DB Proxy';
import { CompleteAlbum, CompleteArtist } from './DeezerHandler';
import { GetImageOfArtist } from '../Proxy/Deezer Proxy';
import { RegisterToUserHistory, CheckLikeMusic } from '../../Users/Handler';
import { ReadTagsFromDisk, GetMusicsFiles } from '../Proxy/Disk Proxy';
import StreamingQueue, { IStreamQueueResult } from '../Proxy/Downloader Proxy/StreamQueue';
import {
	IAlbum, IArtist, IDeezerMusic, IMusic, IPlaylist,
} from '../Interfaces';

const Location = 'Musics.Handler.DBHandler';

export const MakeIndexation = async () : Promise<void> => {
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
};

// TODO: fix type here
export const HandleMusicRequestById = (
	id: ObjectId,
	UserReq: any,
) : Promise<IMusic> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(Location, `Searching for music with db id ${id}`);
		Music.findById(id, async (err, doc) => {
			if (err) {
				MopConsole.error(Location, err);
				reject(err);
				return;
			}
			if (!doc) {
				MopConsole.warn(Location, `Music id not found ${id}`);
				reject(new Error(`Music not found for id  ${id}`));
				return;
			}
			const MusicDoc = doc.toObject();
			if (MusicDoc) {
				MopConsole.debug(Location, `Found music with title ${MusicDoc.Title}`);
				MusicDoc.FilePath = MusicDoc.FilePath
					? path.basename(MusicDoc.FilePath) : undefined;
				const AlbumOfMusic = await FindAlbumContainingMusic(MusicDoc);
				MusicDoc.Image = AlbumOfMusic.Image;
				MusicDoc.ImagePathDeezer = AlbumOfMusic.ImagePathDeezer;
				MusicDoc.ImageFormat = AlbumOfMusic.ImageFormat;
				if (UserReq) MusicDoc.IsLiked = await CheckLikeMusic(UserReq, MusicDoc._id);
			}
			resolve(MusicDoc);
		});
	},
);
export const HandleAlbumRequestById = (id: ObjectId) : Promise<IAlbum> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(Location, `Searching for album with db id ${id}`);
		Album.findById(id)
			.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
			.exec(async (err, doc) => {
				if (err) {
					MopConsole.error('Action.Album', err.message);
					reject(err);
					return;
				}
				if (!doc) {
					MopConsole.warn('Action.Album', `Album id not found ${id}`);
					reject(new Error(`Album not found for id  ${id}`));
					return;
				}
				let AlbumDoc = doc.toObject();
				MopConsole.debug(Location, `Found album named ${AlbumDoc.Name}`);
				if (AlbumDoc.DeezerId) {
					if (!AlbumDoc.IsComplete) {
						MopConsole.debug(Location, 'It is an incomplete deezer album, requesting all musics of the album');

						await CompleteAlbum(AlbumDoc);

						const newAlbum = await Album.findById(id);
						await newAlbum.populate({ path: 'MusicsId', options: { sort: { TrackNumber: 1 } } })
							.execPopulate();

						AlbumDoc = await newAlbum.toObject();
					}
				}
				resolve(AlbumDoc);
			});
	},
);
export const HandleArtistRequestById = (id: ObjectId) : Promise<IArtist> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(Location, `Searching for artist with db id ${id}`);
		Artist.findById(id)
			.populate({
				path: 'AlbumsId',
				populate: {
					path: 'MusicsId',
					model: 'Music',
				},
			})
			.exec(async (err, doc) => {
				let ArtistDoc = doc;
				if (err) {
					MopConsole.error(Location, err.message);
					reject(err);
					return;
				}
				if (!ArtistDoc) {
					MopConsole.warn(Location, `Artist id not found ${id}`);
					reject(new Error(`Artist not found for id  ${id}`));
					return;
				}
				MopConsole.debug(Location, `Found artist named ${ArtistDoc.Name}`);
				if (ArtistDoc.DeezerId) {
					await CompleteArtist(ArtistDoc);
					ArtistDoc = await Artist.findById(id).populate({
						path: 'AlbumsId',
						populate: {
							path: 'MusicsId',
							model: 'Music',
						},
					});
					if (!ArtistDoc.ImagePath) {
						ArtistDoc.ImagePath = await GetImageOfArtist(ArtistDoc.DeezerId);
						ArtistDoc.save();
					}
				}
				resolve(ArtistDoc);
			});
	},
);

export const HandlePlaylistRequestById = (id: ObjectId) : Promise<IPlaylist> => new Promise(
	(resolve, reject) => {
		MopConsole.debug(Location, `Searching for playlist with db id ${id}`);
		Playlist.findById(id)
			.populate('Creator')
			.populate({
				path: 'MusicsId',
				populate: [{
					path: 'AlbumId',
					model: 'Album',
				}],
			})
			.exec(
				async (err, doc) => {
					if (err) {
						MopConsole.error(Location, err.message);
						reject(err);
						return;
					}
					if (!doc) {
						MopConsole.warn(Location, `Playlist id not found ${id}`);
						reject(new Error(`Playlist not found for id  ${id}`));
					}

					const PlaylistDoc = doc.toObject();

					PlaylistDoc.Image = PlaylistDoc.MusicsId[0].AlbumId.Image;
					PlaylistDoc.ImagePathDeezer = PlaylistDoc.MusicsId[0].AlbumId.ImagePathDeezer;
					PlaylistDoc.ImageFormat = PlaylistDoc.MusicsId[0].AlbumId.ImageFormat;

					resolve(PlaylistDoc);
				},
			);
	},
);

export const AddMusicsToPlaylist = (
	PlaylistId : ObjectId,
	MusicsId : Array<ObjectId>,
) : Promise<void> => new Promise((resolve, reject) => {
	MopConsole.debug(Location, `Adding ${MusicsId} to playlist ${PlaylistId})`);
	Playlist.updateOne({ _id: PlaylistId },
		{ $push: { MusicsId: { $each: MusicsId } } },
		{ upsert: true }, (err) => {
			if (err) {
				MopConsole.error(Location, err);
				reject(err);
				return;
			}
			resolve();
		});
});

export const RemoveMusicOfPlaylist = (
	PlaylistId : ObjectId,
	MusicId : ObjectId,
) : Promise<void> => new Promise((resolve, reject) => {
	MopConsole.debug(Location, `Removing ${MusicId} of playlist ${PlaylistId})`);
	Playlist.updateOne({ _id: PlaylistId }, { $pullAll: { MusicsId: [MusicId] } }, (err) => {
		if (err) {
			MopConsole.error(Location, err);
			reject(err);
			return;
		}
		resolve();
	});
});

export const RemovePlaylistById = (
	PlaylistId: ObjectId,
) : Promise<void> => new Promise((resolve, reject) => {
	MopConsole.debug(Location, `Deleting playlist (db id: ${PlaylistId})`);
	Playlist.deleteOne({ _id: PlaylistId }, (err) => {
		if (err) {
			MopConsole.error(Location, err);
			reject(err);
			return;
		}
		resolve();
	});
});

export const GetMusicFilePath = (
	id : ObjectId,
	UserReq : any,
	RegisterHistory = true,
) : Promise<{ FilePath? : string, DeezerId?: number}> => new Promise((resolve, reject) => {
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
			MusicDoc.LastView = new Date();
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

		MopConsole.debug(Location, `Music file path for db id ${id} is not present, using stream instead`);
		resolve({ DeezerId: doc.DeezerId });
	});
});

export const GetMusicStream = async (
	id : number,
) : Promise<IStreamQueueResult> => await StreamingQueue.AddToQueueAsync(id);

export const IncrementLikeCount = async (
	id: ObjectId,
	increment = 1,
) : Promise<void> => {
	const music = await Music.findById(id);
	music.Likes += increment;
	await music.save();
	MopConsole.debug(Location, `Increased like count of music ${id} by ${increment}`);
};

/** Add multiple deezer formatted music to mongodb
 * @param {Object[]} tags Array of musics from deezer api
 * @returns {Promise<string[]>} return a promise resolving by an array of music db ids
 */
export const AddMusicsFromDeezer = async (tags: Array<IDeezerMusic>) : Promise<Array<ObjectId>> => {
	const MusicDbIds = [];
	for (const musicTags of tags) {
		const DbId = await HandleNewMusicFromDz(musicTags);
		MusicDbIds.push(DbId);
	}
	return MusicDbIds;
};
