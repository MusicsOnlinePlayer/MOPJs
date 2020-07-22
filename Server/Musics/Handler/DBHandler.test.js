require('regenerator-runtime/runtime');

const {
	HandleMusicRequestById,
	HandleAlbumRequestById,
	HandleArtistRequestById,
} = require('./DBHandler');

const {
	connect,
	clearDatabase,
	closeDatabase,
} = require('../../Tests/DbHandler');
const { Music, Album, Artist } = require('../Model');

beforeAll(async () => await connect());

afterEach(async () => await clearDatabase());

afterAll(async () => await closeDatabase());

const SampleArtist = {
	Name: 'Kendrick Lamar',
	DeezerId: 1000,
};

const SampleAlbum = {
	Name: 'DAMN.',
	DeezerId: 1001,
	IsComplete: true,
	ImagePathDeezer: 'https://e-cdns-images.dzcdn.net/images/cover/012b27906b430a37ec1d8f793d5c4fa6/500x500-000000-80-0-0.jpg',
};

const SampleMusic = {
	Title: 'HUMBLE.',
	Album: 'DAMN.',
	Artist: 'Kendrick Lamar',
	TrackNumber: 8,
	DeezerId: 350171311,
	FilePath: 'C:\\MusicsFakeFolder\\humble.mp3',
};


describe('Musics.Handler.DBHandler should work properly', () => {
	it('Should get a music by a db id, and gather additional important info about the music requested', async () => {
		const m1 = await Music.create(SampleMusic);
		await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });

		const NotFoundMusic = await HandleMusicRequestById('5ec5a5e79e29336824be64a5');
		expect(NotFoundMusic).toStrictEqual({});

		const FoundMusic = await HandleMusicRequestById(m1._id);
		expect(FoundMusic).toMatchObject({
			Title: 'HUMBLE.',
			Album: 'DAMN.',
			Artist: 'Kendrick Lamar',
			TrackNumber: 8,
			DeezerId: 350171311,
			FilePath: 'humble.mp3',
			ImagePathDeezer: SampleAlbum.ImagePathDeezer,
		});
	});
	it('Should get an album by a db id, and gather ids of musics in it', async () => {
		const m1 = await Music.create(SampleMusic);
		const a1 = await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });

		const NotFoundAlbum = await HandleAlbumRequestById('5ec5a5e79e29336824be64a5');
		expect(NotFoundAlbum).toStrictEqual({});

		const FoundAlbum = await HandleAlbumRequestById(a1._id);
		expect(FoundAlbum).toMatchObject({
			Name: 'DAMN.',
			DeezerId: 1001,
			IsComplete: true,
			ImagePathDeezer: SampleAlbum.ImagePathDeezer,
		});
		expect(FoundAlbum.MusicsId).toContainEqual(m1._id);
	});

	it('Should get an artist by a db id and all his albums', async () => {
		const m1 = await Music.create(SampleMusic);
		const a1 = await Album.create({ ...SampleAlbum, MusicsId: [m1._id] });
		const ar1 = await Artist.create({ ...SampleArtist, DeezerId: undefined, AlbumsId: [a1._id] });

		const NotFoundArtist = await HandleArtistRequestById('5ec5a5e79e29336824be64a5');
		expect(NotFoundArtist).toStrictEqual({});

		const FoundArtist = await HandleArtistRequestById(ar1._id);
		expect(FoundArtist).toMatchObject({ Name: SampleArtist.Name });
		expect(FoundArtist.AlbumsId).toContainEqual(a1._id);
	});
});
