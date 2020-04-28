const {
	MusicsFolder, GetFilesOfDir, CreateFilePathForDb, CheckIfFileHasCorrectFormat,
} = require('./Utils');
const { ReadTags } = require('./Tags');
const { HandleNewMusicFromDisk } = require('./MusicHandler');
const { Music } = require('../Models');

const Indexation = async () => {
	console.log('[Music Indexer] Starting indexing');
	console.time('[Music Indexer] Time ');
	const files = GetFilesOfDir(MusicsFolder);
	/* eslint no-restricted-syntax: "off" */
	for (const file of files) {
		const MusicFilePath = CreateFilePathForDb(MusicsFolder, file);

		const count = await Music.countDocuments({ FilePath: MusicFilePath });

		if (count === 0 && CheckIfFileHasCorrectFormat(MusicFilePath)) {
			console.log(`[Music Indexer] Adding ${MusicFilePath}`);
			const tags = await ReadTags(MusicFilePath);
			// console.log(tags);
			if (tags.title && tags.album && tags.artist[0] && tags.track.no) {
				await HandleNewMusicFromDisk(tags, MusicFilePath);
			}
		}
	}
	console.log(`[Music Indexer] Done - ${files.length} musics`);
	console.timeEnd('[Music Indexer] Time ');
};

module.exports = {
	DoIndexation: Indexation,
};
