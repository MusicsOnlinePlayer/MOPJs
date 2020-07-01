const { GetMusicsFiles } = require('./Indexer');
const { ReadTags: ReadTagsFromDisk } = require('./TagsReader');

module.exports = {
	GetMusicsFiles,
	ReadTagsFromDisk,
};
