require('regenerator-runtime/runtime');

const {
	FindAlbumContainingMusic,
	HandleAlbumsFromDz,
} = require('./Albums');

const {
	connect,
	clearDatabase,
	closeDatabase,
} = require('../../../Tests/DbHandler');
const { Music, Album, Artist } = require('../../Model');

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

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


describe('Musics.DBProxy.Albums should work properly', () => {
	it('Should get albums of an Artist properly', async () => {
		const m = await Music.create(SampleMusic);
		SampleAlbum.MusicsId = [m._id];
		const a = await Album.create(SampleAlbum);

		expect((await FindAlbumContainingMusic(m))._id).toEqual(a._id);

		const m2 = await Music.create({ Album: 'ALBUM' });

		await Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });
		const a2 = await Album.create({ Name: 'ALBUM', MusicsId: [m2._id] });

		expect((await FindAlbumContainingMusic(m2))._id).toEqual(a2._id);
	});
	it('Should append album from deezer to an artist', async () => {
		const a1 = {
			title: 'ALBUM1',
			id: 110,
		};
		const a3 = {
			title: 'ALBUM3',
			id: 100,
		};
		const A = await Artist.create({ DeezerId: 100, AlbumsId: [] });

		await HandleAlbumsFromDz(100, [a3, a1]);

		const newArtist = await Artist.findById(A._id).lean();

		expect(newArtist.AlbumsId.length).toEqual(2);
	});
});
