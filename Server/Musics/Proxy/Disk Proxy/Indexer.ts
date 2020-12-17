import fs from 'fs';
import path from 'path';
import MopConsole from '../../../Tools/MopConsole';
import { MusicsFolder } from '../../Config';

const Location = 'Musics.Proxy.DiskProxy.Indexer';

const GetFilesOfDir = (Dir: string) => fs.readdirSync(Dir);
const CreateFilePathForDb = (Dir: string, file: string) => path.join(Dir, path.basename(file));
const CheckIfFileHasCorrectFormat = (file: string) => path.extname(file) === '.mp3';

/** Retrieve all musics contained in the 'MusicsFolder' directory.
 * It also make sure extensions of these file are actual mp3 files
 * @returns {string[]} File paths of all valid musics files
 */
// eslint-disable-next-line import/prefer-default-export
export const GetMusicsFiles = () : Array<string> => {
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
};
