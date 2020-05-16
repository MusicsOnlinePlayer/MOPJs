const {
	MusicsFolder, GetFilesOfDir, CreateFilePathForDb, CheckIfFileHasCorrectFormat,
} = require('./Utils');
const { ReadTags } = require('./Tags');
const { HandleNewMusicFromDisk, DoesMusicExists, GetMusicCount } = require('./MusicHandler');
const MopConsole = require('../../Tools/MopConsole');

/** This function perform an indexation on the MusicsFolder
 */
const Indexation = async () => {
	MopConsole.info('Music Indexer', 'Starting indexing');
	MopConsole.time('Music Indexer', 'Time ');
	const files = GetFilesOfDir(MusicsFolder);
	/* eslint no-restricted-syntax: "off" */
	for (const file of files) {
		const MusicFilePath = CreateFilePathForDb(MusicsFolder, file);

		const exist = await DoesMusicExists(MusicFilePath);

		if (!exist && CheckIfFileHasCorrectFormat(MusicFilePath)) {
			MopConsole.info('Music Indexer', `Adding ${MusicFilePath}`);
			let tags;
			try {
				tags = await ReadTags(MusicFilePath);
			} catch (err) {
				MopConsole.warn('Music Indexer', `Cannot read tags of music file ${MusicFilePath}`);
			}
			// console.log(tags);
			if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
				await HandleNewMusicFromDisk(tags, MusicFilePath);
			} else {
				MopConsole.warn('Music Indexer', `Skipped ${MusicFilePath} (Missing tags)`);
			}
		}
	}
	MopConsole.info('Music Indexer', `Done - ${await GetMusicCount()} musics on Database (${files.length} on the disk)`);
	MopConsole.timeEnd('Music Indexer', 'Time ');
};

module.exports = {
	DoIndexation: Indexation,
};
