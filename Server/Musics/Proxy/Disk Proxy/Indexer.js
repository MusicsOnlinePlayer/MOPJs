const fs = require('fs');
const path = require('path');
const MopConsole = require('../../../Tools/MopConsole');
const { MusicsFolder } = require('../../Config');

const Location = 'Musics.Proxy.DiskProxy.Indexer';


const GetFilesOfDir = (Dir) => fs.readdirSync(Dir);
const CreateFilePathForDb = (Dir, file) => path.join(Dir, path.basename(file));
const CheckIfFileHasCorrectFormat = (file) => path.extname(file) === '.mp3';

module.exports = {
	/** Retrieve all musics contained in the 'MusicsFolder' directory.
	 * It also make sure extensions of these file are actual mp3 files
	 * @returns {string[]} File paths of all valid musics files
	 */
	GetMusicsFiles: async () => {
		MopConsole.info(Location, `Getting musics in ${MusicsFolder}`);
		const CorrectMusicFilesPath = [];

		const files = GetFilesOfDir(MusicsFolder);
		/* eslint no-restricted-syntax: "off" */
		for (const file of files) {
			const MusicFilePath = CreateFilePathForDb(MusicsFolder, file);

			if (CheckIfFileHasCorrectFormat(MusicFilePath)) {
				CorrectMusicFilesPath.push(MusicFilePath);
			}
		}

		MopConsole.info(Location, `Found ${CorrectMusicFilesPath.length} music files in folder ${MusicsFolder}`);
		return CorrectMusicFilesPath;
	},
};
