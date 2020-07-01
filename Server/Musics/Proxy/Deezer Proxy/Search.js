const { default: Axios } = require('axios');
const MopConsole = require('../../../Tools/MopConsole');

const LogLocation = 'Musics.Proxy.DeezerProxy.Search';

module.exports = {
	SearchMusics: (Query) => new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `Begin search for query ${Query}`);
		Axios.get(`https://api.deezer.com/search?q=${Query}`)
			.then(async (res) => {
				MopConsole.debug(LogLocation, `Found ${res.data.data.length} musics`);
				resolve(res.data.data);
			})
			.catch((err) => {
				MopConsole.error(LogLocation, err);
				reject();
			});
	}),
};
