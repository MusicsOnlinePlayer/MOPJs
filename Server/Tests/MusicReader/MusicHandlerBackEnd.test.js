require('regenerator-runtime/runtime');

const dbHandler = require('../DbHandler');
const {
	AppendDzImageToArtist,
} = require('../../Database/MusicReader/MusicHandlerBackEnd');
const {
	Artist,
} = require('../../Database/Models/Music');


const SampleArtist = {
	Name: 'U2',
	DeezerId: 1000,
};


beforeAll(async () => await dbHandler.connect());

afterEach(async () => await dbHandler.clearDatabase());

afterAll(async () => await dbHandler.closeDatabase());

describe('Music Reader BackEnd', () => {
	it('Can update image of artist', async () => {
		const c = await Artist.create(SampleArtist);
		await AppendDzImageToArtist(SampleArtist.DeezerId, 'u2imagepath');

		const foundArtist = await Artist.findById(c._id);
		expect(foundArtist.ImagePath).toEqual('u2imagepath');
	});
});
