const { ReadTags } = require('./Tags');
const { MusicsFolder, ArtistsImageFolder } = require('./Utils');
const { RegisterDownloadedFile, HandleNewMusicFromDz, HandleMusicsFromDz } = require('./MusicHandler');
const { DoIndexation } = require('./Indexer');

module.exports = {
	ReadTags,
	MusicsFolder,
	RegisterDownloadedFile,
	HandleNewMusicFromDz,
	DoIndexation,
	ArtistsImageFolder,
	HandleMusicsFromDz,
};
