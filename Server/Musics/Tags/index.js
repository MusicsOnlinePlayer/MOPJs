const { ConvertTags: ConvertTagsFromDz } = require('./DeezerTagsInterpreter');
const { ConvertTags: ConvertTagsFromDisk } = require('./DiskTagsInterpreter');

module.exports = {
	ConvertTagsFromDz,
	ConvertTagsFromDisk,
};
