const MopConsole = require('../Tools/MopConsole');
const { User } = require('../Database/Models');
const { GetLikedMusics, GetViewedMusics } = require('../Database/MusicReader');

const RegisterUser = (username, password) => new Promise((resolve, reject) => {
	try {
		const user = new User({
			username,
		});
		user.setPassword(password)
			.then(async () => {
				const newUser = await user.save();
				resolve(newUser);
				MopConsole.info('Action.User.Auth', `Added user ${username}`);
			})
			.catch((err) => {
				MopConsole.warn('Action.User.Auth', "Couldn't set password of user");
				MopConsole.warn('Action.User.Auth', err);
				reject();
			});
	} catch (err) {
		MopConsole.warn('Action.User.Auth', "Couldn't register user");
		MopConsole.warn('Action.User.Auth', err);
		reject();
	}
});

const GetLikedMusicsOfUser = async (UserReq) => await GetLikedMusics(UserReq._id);

const GetViewedMusicsOfUser = async (UserReq) => await GetViewedMusics(UserReq._id);

module.exports = {
	RegisterUser,
	GetLikedMusicsOfUser,
	GetViewedMusicsOfUser,
};
