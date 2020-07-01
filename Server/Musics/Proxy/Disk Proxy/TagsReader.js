const fs = require('fs');
const mm = require('musicmetadata');

/** This function retrieves ID3 tags of a music
 * @param {string} filePath - File path of the music
 */
const ReadTags = (filePath) => new Promise((resolve, reject) => {
	mm(fs.createReadStream(filePath), (err, meta) => {
		if (err) {
			reject(err);
			return;
		}

		resolve(meta);
	});
});

module.exports = {
	ReadTags,
};
