import fs from 'fs';
import mm from 'musicmetadata';
import { IDiskMusic } from '../../Interfaces';

/** This function retrieves ID3 tags of a music
 * @param {string} filePath - File path of the music
 */
// eslint-disable-next-line import/prefer-default-export
export const ReadTags = (filePath: string) : Promise<IDiskMusic> => new Promise(
	(resolve, reject) => {
		mm(fs.createReadStream(filePath), (err: string, meta: IDiskMusic) => {
			if (err) {
				reject(err);
				return;
			}

			resolve(meta);
		});
	},
);
