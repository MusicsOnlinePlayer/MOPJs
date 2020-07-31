const { ConvertTags: ConvertTagsFromDz, ConvertTagsFromDzAlbum } = require('./DeezerTagsInterpreter');
const { ConvertTags: ConvertTagsFromDisk } = require('./DiskTagsInterpreter');

module.exports = {
	ConvertTagsFromDz,
	ConvertTagsFromDzAlbum,
	ConvertTagsFromDisk,
};
