require('regenerator-runtime/runtime');

const dbHandler = require('../DbHandler');
const {
	AppendDzImageToArtist,
	AppendDzCoverToAlbum,
	GetMusicCount,
	RegisterDownloadedFile,
	DoesMusicExistsTitle,
	DoesMusicExists,
	FindAlbumContainingMusic,
	UpdateAlbumCompleteStatus,
	AppendAlbumsToArtist,
	AppendOrUpdateMusicToAlbum,
	AddMusicToDatabase,
	LikeMusic,
	CheckLikeMusic,
	GetLikedMusics,
	GetViewedMusics,
	DoesMusicExistsTitleDzId,
} = require('../../Database/MusicReader/MusicHandlerBackEnd');
const {
	Artist,
	Album,
	Music,
} = require('../../Database/Models/Music');

const {
	User,
} = require('../../Database/Models/User');
const { ConvertTagsFromDz } = require('../../Database/MusicReader/Tags');

const SampleArtist = {
	Name: 'U2',
	DeezerId: 1000,
};

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

const SampleMusicFromDzAPI = {
	id: 136336110,
	readable: true,
	title: '24K Magic',
	title_short: '24K Magic',
	title_version: '',
	link: 'https://www.deezer.com/track/136336110',
	duration: 225,
	rank: 909724,
	explicit_lyrics: false,
	explicit_content_lyrics: 6,
	explicit_content_cover: 0,
	preview: 'https://cdns-preview-6.dzcdn.net/stream/c-633e75a95d0917b64e51355c4b84937a-4.mp3',
	artist: {
		id: 429675,
		name: 'Bruno Mars',
		link: 'https://www.deezer.com/artist/429675',
		picture: 'https://api.deezer.com/artist/429675/image',
		picture_small: 'https://cdns-images.dzcdn.net/images/artist/25d38ffc3fd6a36ac71a08ff6ed90fa2/56x56-000000-80-0-0.jpg',
		picture_medium: 'https://cdns-images.dzcdn.net/images/artist/25d38ffc3fd6a36ac71a08ff6ed90fa2/250x250-000000-80-0-0.jpg',
		picture_big: 'https://cdns-images.dzcdn.net/images/artist/25d38ffc3fd6a36ac71a08ff6ed90fa2/500x500-000000-80-0-0.jpg',
		picture_xl: 'https://cdns-images.dzcdn.net/images/artist/25d38ffc3fd6a36ac71a08ff6ed90fa2/1000x1000-000000-80-0-0.jpg',
		tracklist: 'https://api.deezer.com/artist/429675/top?limit=50',
		type: 'artist',
	},
	album: {
		id: 14581500,
		title: '24K Magic',
		cover: 'https://api.deezer.com/album/14581500/image',
		cover_small: 'https://cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/56x56-000000-80-0-0.jpg',
		cover_medium: 'https://cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/250x250-000000-80-0-0.jpg',
		cover_big: 'https://cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/500x500-000000-80-0-0.jpg',
		cover_xl: 'https://cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/1000x1000-000000-80-0-0.jpg',
		tracklist: 'https://api.deezer.com/album/14581500/tracks',
		type: 'album',
	},
	type: 'track',
};

beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe('Music Reader BackEnd', () => {
	it('Should update image of artist', async () => {
		const imgPath = 'u2ImagePath';

		const c = await Artist.create(SampleArtist);
		await AppendDzImageToArtist(SampleArtist.DeezerId, imgPath);

		const foundArtist = await Artist.findById(c._id);
		expect(foundArtist.ImagePath).toEqual(imgPath);
	});

	it('Should append album cover to existing album', async () => {
		const coverPath = 'AlbumCover';

		const c = await Album.create(SampleAlbum);
		await AppendDzCoverToAlbum(c.DeezerId, coverPath);

		const foundAlbum = await Album.findById(c._id);
		expect(foundAlbum.ImagePathDeezer).toEqual(coverPath);
	});

	it('Should count music in the collection', async () => {
		await Music.create(SampleMusic);

		expect(await GetMusicCount()).toEqual(1);
	});

	it('Should update file path of music', async () => {
		const path = 'MyFilePath';
		const c = await Music.create(SampleMusic);

		await RegisterDownloadedFile(c.DeezerId, path);

		const foundMusic = await Music.findById(c._id);
		expect(foundMusic.FilePath).toEqual(path);
	});

	it('Should determine if music exist based on the title and deezer id', async () => {
		expect(await DoesMusicExistsTitleDzId(SampleMusic.Title, SampleMusic.DeezerId)).toEqual(false);

		await Music.create(SampleMusic);

		expect(await DoesMusicExistsTitleDzId(SampleMusic.Title, SampleMusic.DeezerId)).toEqual(true);
	});

	it('Should determine if music exist based on the title', async () => {
		expect(await DoesMusicExistsTitle(SampleMusic.Title)).toEqual(false);

		await Music.create(SampleMusic);

		expect(await DoesMusicExistsTitle(SampleMusic.Title)).toEqual(true);
	});

	it('Should determine if music exist based on the file path', async () => {
		SampleMusic.FilePath = 'MyFilePath';

		expect(await DoesMusicExists(SampleMusic.FilePath)).toEqual(false);

		await Music.create(SampleMusic);

		expect(await DoesMusicExists(SampleMusic.FilePath)).toEqual(true);
		SampleMusic.FilePath = undefined;
	});

	it('Should be able to resolve album base on a given music', async () => {
		const m = await Music.create(SampleMusic);
		SampleAlbum.MusicsId = [m._id];
		const a = await Album.create(SampleAlbum);

		expect((await FindAlbumContainingMusic(m))._id).toEqual(a._id);

		const m2 = await Music.create({ Album: 'ALBUM' });

		await Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });
		const a2 = await Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });

		expect((await FindAlbumContainingMusic(m2))._id).toEqual(a2._id);
	});

	it('Should update an album status', async () => {
		const m2 = await Music.create({ Album: 'ALBUM' });

		const a1 = await Album.create({ Name: 'ALBUM', DeezerId: 100, MusicsId: [m2._id] });
		await Album.create({ Name: 'ALBUM', DeezerId: 10, MusicsId: [m2._id] });

		await UpdateAlbumCompleteStatus(100);

		expect((await Album.findById(a1._id)).IsComplete).toEqual(true);
	});

	it('Should append album to an artist', async () => {
		const a1 = await Album.create({ Name: 'ALBUM1', DeezerId: 80 });
		const a2 = await Album.create({ Name: 'ALBUM1', DeezerId: 90 });
		const a3 = await Album.create({ Name: 'ALBUM3', DeezerId: 100 });

		const A = await Artist.create({ DeezerId: 100, AlbumsId: [a1._id, a2._id] });

		await AppendAlbumsToArtist(100, [a3, a1]);

		const newArtist = await Artist.findById(A._id).lean();

		expect(newArtist.AlbumsId.sort()).toEqual([a1._id, a2._id, a3._id].sort());
	});

	it('Should append or update music to album', async () => {
		const m1 = await Music.create({ Title: 'MUSIC1', DeezerId: 100 });
		await Music.create({ Title: 'MUSIC2', DeezerId: 90 });
		await Music.create({ Title: 'MUSIC3', DeezerId: 80 });

		const a1 = await Album.create({ Name: 'ALBUM1', DeezerId: 80 });

		const MusicObject = m1.toObject();
		MusicObject.TrackNumber = 10;

		await AppendOrUpdateMusicToAlbum(MusicObject);

		expect((await Music.findById(m1._id)).TrackNumber).toEqual(MusicObject.TrackNumber);

		const MusicTags = {
			Title: 'MUSIC4',
			DeezerId: 110,
			Album: 'ALBUM1',
		};

		await AppendOrUpdateMusicToAlbum(MusicTags, a1.DeezerId);

		const newAlbum = await Album.findById(a1._id);
		await newAlbum.populate('MusicsId').execPopulate();
		expect(newAlbum.MusicsId[0].Title).toEqual(MusicTags.Title);
	});

	it('Should append music to database from disk', async () => {
		const MusicTags = {
			Title: 'MUSIC1',
			DeezerId: 110,
			Album: 'ALBUM1',
			Artist: 'ARTIST1',
		};

		await AddMusicToDatabase(MusicTags);

		const newMusic = await Music.findOne({ Title: 'MUSIC1' });
		const newAlbum = await Album.findOne({ Name: 'ALBUM1' });
		const newArtist = await Artist.findOne({ Name: 'ARTIST1' });

		expect(newMusic._id).not.toBe(undefined);
		expect(newAlbum._id).not.toBe(undefined);
		expect(newArtist._id).not.toBe(undefined);
	});

	it('Should append music to database from deezer API', async () => {
		await AddMusicToDatabase(ConvertTagsFromDz(SampleMusicFromDzAPI, SampleMusicFromDzAPI.id));

		const newMusic = await Music.findOne({ Title: '24K Magic' });
		const newAlbum = await Album.findOne({ Name: '24K Magic' });
		const newArtist = await Artist.findOne({ Name: 'Bruno Mars' });

		expect(newMusic._id).not.toBe(undefined);
		expect(newAlbum._id).not.toBe(undefined);
		expect(newArtist._id).not.toBe(undefined);
	});

	it('Should append music to database from deezer API even if music title is already taken', async () => {
		await AddMusicToDatabase(ConvertTagsFromDz(SampleMusicFromDzAPI, SampleMusicFromDzAPI.id));

		const SameMusic = SampleMusicFromDzAPI;
		SameMusic.id = 20072003;

		await AddMusicToDatabase(ConvertTagsFromDz(SameMusic, SameMusic.id));
		await AddMusicToDatabase(ConvertTagsFromDz(SameMusic, SameMusic.id));

		const newMusic = await Music.findOne({ Title: '24K Magic', DeezerId: SameMusic.id });
		const newAlbum = await Album.findOne({ Name: '24K Magic' });
		const newArtist = await Artist.findOne({ Name: 'Bruno Mars' });

		expect(newMusic._id).not.toBe(undefined);
		expect(newAlbum._id).not.toBe(undefined);
		expect(newArtist._id).not.toBe(undefined);

		const musicCount = await GetMusicCount();
		expect(musicCount).toBe(2);
	});

	it('Should be able to like a music', async () => {
		const MyUser = {
			username: 'Malau',
		};
		const MyMusic = {
			Title: 'MUSIC1',
		};

		const MyMusic2 = {
			Title: 'MUSIC2',
		};

		const m = await Music.create(MyMusic);
		const m2 = await Music.create(MyMusic2);
		const u = await User.create(MyUser);

		await LikeMusic(m._id, u._id);
		await LikeMusic(m2._id, u._id);

		const newUser1 = await User.findById(u._id).lean();
		const newMusic1 = await Music.findById(m._id);
		const newMusic2 = await Music.findById(m2._id);

		expect(newUser1.LikedMusics).toEqual([m._id, m2._id]);
		expect(newMusic1.Likes).toEqual(1);
		expect(newMusic2.Likes).toEqual(1);

		await LikeMusic(m._id, u._id);
		await LikeMusic(m2._id, u._id);

		const newMusic3 = await Music.findById(m._id);
		const newMusic4 = await Music.findById(m2._id);
		const newUser2 = await User.findById(u._id).lean();

		expect(newUser2.LikedMusics).toEqual([]);
		expect(newMusic3.Likes).toEqual(0);
		expect(newMusic4.Likes).toEqual(0);
	});

	it('Should check if a music is liked or not', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};

		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
			LikedMusics: [m._id],
		};

		const u = await User.create(MyUser);
		const IsLiked = await CheckLikeMusic(m._id, u._id);

		expect(IsLiked).toEqual(true);

		await LikeMusic(m._id, u._id);

		const IsLiked2 = await CheckLikeMusic(m._id, u._id);

		expect(IsLiked2).toEqual(false);
	});

	it('Should get all liked musics of an user', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};
		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
			LikedMusics: [m._id],
		};

		const u = await User.create(MyUser);

		const LikedMusics = await GetLikedMusics(u._id);

		expect(LikedMusics).toEqual([m._id]);
	});

	it('Should get all viewed musics of an user', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};
		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
			ViewedMusics: [m._id],
		};

		const u = await User.create(MyUser);

		const ViewedMusics = await GetViewedMusics(u._id);

		expect(ViewedMusics).toEqual([m._id]);
	});
});