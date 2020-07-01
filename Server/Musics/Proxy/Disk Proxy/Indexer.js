const fs = require('fs');
const path = require('path');
const MopConsole = require('../../../Tools/MopConsole');
const { MusicsFolder } = require('../../../Database/MusicReader/Utils');

const Location = 'Musics.Proxy.DiskProxy.Indexer';


const GetFilesOfDir = (Dir) => fs.readdirSync(Dir);
const CreateFilePathForDb = (Dir, file) => path.join(Dir, path.basename(file));
const CheckIfFileHasCorrectFormat = (file) => path.extname(file) === '.mp3';

module.exports = {
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
