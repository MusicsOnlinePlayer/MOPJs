const { ConnectToDB } = require('./Server/Database/index');
const { Album, Music } = require('./Server/Musics/Model/index');
const MopConsole = require('./Server/Tools/MopConsole');

const FlipAllAlbumStatusToNotComplete = async () => {
	MopConsole.info('External.Utils', 'Changing all album status to not complete');
	await ConnectToDB();
	const res = await Album.updateMany({}, { IsComplete: false });
	MopConsole.info('External.Utils', `Done for ${res.nModified} albums`);
};

const FillAlbumIdField = async () => {
	MopConsole.info('External.Utils', 'Filling AlbumId Fields');
	await ConnectToDB();
	const AllAlbums = await Album.find({}).populate('MusicsId');
	MopConsole.info('External.Utils', `Got ${AllAlbums.length} albums`);
	AllAlbums.forEach((MyAlbum, i) => {
		MopConsole.info('External.Utils', `Processing album ${i}/${AllAlbums.length}`);
		MyAlbum.MusicsId.forEach(async (MyMusic) => {
			if (!MyMusic.AlbumId) {
				MopConsole.warn('External.Utils', `Got an empty album id field ${MyMusic._id}`);
				const m = await Music.findById(MyMusic._id);
				m.AlbumId = MyAlbum._id;
				await m.save();
				MopConsole.warn('External.Utils', `Album id field set for ${MyMusic._id}`);
			}
		});
	});
	MopConsole.info('External.Utils', 'Done');
};

// FlipAllAlbumStatusToNotComplete();
FillAlbumIdField();
