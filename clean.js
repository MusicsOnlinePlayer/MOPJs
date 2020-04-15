const { ClearMusics } = require('./Server/Actions').Music;
const { ConnectToDB } = require('./Server/Database/Db');

console.log('[MOP - Clean] Cleaning db');

ConnectToDB().then(() => {
	ClearMusics().then(() => {
		console.log('[MOP - Clean] Done');
	});
});
