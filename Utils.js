const { ConnectToDB } = require('./Server/Database/Db');
const { Album } = require('./Server/Database/Models');
const MopConsole = require('./Server/Tools/MopConsole');

const FlipAllAlbumStatusToNotComplete = async () => {
	MopConsole.info('Utils', 'Changing all album status to not complete');
	await ConnectToDB();
	const res = await Album.updateMany({}, { IsComplete: false });
	MopConsole.info('Utils', `Done for ${res.nModified} albums`);
};

FlipAllAlbumStatusToNotComplete();
