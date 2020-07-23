require('regenerator-runtime/runtime');

const {
	connect,
	clearDatabase,
	closeDatabase,
} = require('../../../Tests/DbHandler');
const { User } = require('../../Model');
const {
	GetLikedMusicsOfUser, GetViewedMusicsOfUser, CheckLikeMusic, LikeMusicOnUser,
	RegisterToUserHistory,
} = require('./Users');
const { Music } = require('../../../Musics/Model');

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

describe('DB Proxy for user should work properly', () => {
	it('Should get liked musics of an user', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};
		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
			LikedMusics: [m._id],
		};

		const u = await User.create(MyUser);

		const LikedMusics = await GetLikedMusicsOfUser(u._id);

		expect(LikedMusics).toEqual([m._id]);
	});

	it('Should get viewed musics of an user', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};
		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
			ViewedMusics: [m._id],
		};

		const u = await User.create(MyUser);

		const ViewedMusics = await GetViewedMusicsOfUser(u._id);

		expect(ViewedMusics).toEqual([m._id]);
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

		await LikeMusicOnUser(m._id, u._id);

		const IsLiked2 = await CheckLikeMusic(m._id, u._id);

		expect(IsLiked2).toEqual(false);
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

		await LikeMusicOnUser(m._id, u._id);
		await LikeMusicOnUser(m2._id, u._id);

		const newUser1 = await User.findById(u._id).lean();
		await Music.findById(m._id);
		await Music.findById(m2._id);

		expect(newUser1.LikedMusics).toEqual([m._id, m2._id]);

		await LikeMusicOnUser(m._id, u._id);
		await LikeMusicOnUser(m2._id, u._id);

		await Music.findById(m._id);
		await Music.findById(m2._id);
		const newUser2 = await User.findById(u._id).lean();

		expect(newUser2.LikedMusics).toEqual([]);
	});

	it('Should register to user history', async () => {
		const MyMusic = {
			Title: 'MUSIC1',
		};
		const m = await Music.create(MyMusic);

		const MyUser = {
			username: 'Malau',
		};

		const u = await User.create(MyUser);

		await RegisterToUserHistory(m._id, u._id);

		const ViewedMusics = await GetViewedMusicsOfUser(u._id);

		expect(ViewedMusics).toEqual([m._id]);
	});
});
