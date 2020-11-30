const {
	CreateUser,
} = require('@mopjs/dzdownloadernode');

let User;

const GetDownloaderUser = async () => {
	if (User) {
		return User;
	}
	User = await CreateUser(process.env.MOP_DEEZER_ARL);
	return User;
};

module.exports = {
	GetDownloaderUser,
};
