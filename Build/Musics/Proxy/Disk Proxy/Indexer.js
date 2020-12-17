"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const MopConsole_1 = tslib_1.__importDefault(require("../../../Tools/MopConsole"));
const Config_1 = require("../../Config");
const Location = 'Musics.Proxy.DiskProxy.Indexer';
const GetFilesOfDir = (Dir) => fs_1.default.readdirSync(Dir);
const CreateFilePathForDb = (Dir, file) => path_1.default.join(Dir, path_1.default.basename(file));
const CheckIfFileHasCorrectFormat = (file) => path_1.default.extname(file) === '.mp3';
/** Retrieve all musics contained in the 'MusicsFolder' directory.
 * It also make sure extensions of these file are actual mp3 files
 * @returns {string[]} File paths of all valid musics files
 */
// eslint-disable-next-line import/prefer-default-export
exports.GetMusicsFiles = () => {
    MopConsole_1.default.info(Location, `Getting musics in ${Config_1.MusicsFolder}`);
    const CorrectMusicFilesPath = [];
    const files = GetFilesOfDir(Config_1.MusicsFolder);
    /* eslint no-restricted-syntax: "off" */
    for (const file of files) {
        const MusicFilePath = CreateFilePathForDb(Config_1.MusicsFolder, file);
        if (CheckIfFileHasCorrectFormat(MusicFilePath)) {
            CorrectMusicFilesPath.push(MusicFilePath);
        }
    }
    MopConsole_1.default.info(Location, `Found ${CorrectMusicFilesPath.length} music files in folder ${Config_1.MusicsFolder}`);
    return CorrectMusicFilesPath;
};
