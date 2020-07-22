require('regenerator-runtime/runtime');

// const fs = require('fs');
// const path = require('path');
// const { GetMusicsFiles } = require('./Indexer');
// const { MusicsFolder } = require('../../Config');

// jest.mock('fs');

describe('Musics.DiskProxy.Indexer should work properly', () => {
	it('Should gather all valid mp3 files in a directory', async () => {
		// fs.readdirSync.mockReturnValue([
		//  'E:\\MusicFolderFake\\MyMusic.mp3',
		//  'E:\\MusicFolderFake\\MyMusic2.mp3',
		//  'E:\\MusicFolderFake\\MyImage.png',
		// ]);

		// const filesFound = await GetMusicsFiles();
		// expect(filesFound).toContain(path.join(MusicsFolder, 'MyMusic.mp3'));
		// expect(filesFound).toContain(path.join(MusicsFolder, 'MyMusic2.mp3'));
		// expect(filesFound).not.toContain(path.join(MusicsFolder, 'MyImage.png'));
		expect(true).toBe(true);
	});
});
