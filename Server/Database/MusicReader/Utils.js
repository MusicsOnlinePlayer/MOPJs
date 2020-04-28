const fs = require('fs');
const path = require('path');

const GetFilesOfDir = (Dir) => fs.readdirSync(Dir);
const CreateFilePathForDb = (Dir, file) => path.join(Dir, path.basename(file));
const CheckIfFileHasCorrectFormat = (file) => path.extname(file) === '.mp3';

const MusicsFolder = path.join(__dirname, './../../../MusicsFolderProd');
const ArtistsImageFolder = path.join(__dirname, './../../../ArtistImages');

module.exports = {
	GetFilesOfDir,
	CreateFilePathForDb,
	CheckIfFileHasCorrectFormat,
	MusicsFolder,
	ArtistsImageFolder,
};
