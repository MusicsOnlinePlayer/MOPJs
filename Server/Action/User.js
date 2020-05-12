const MopConsole = require('../Tools/MopConsole');
const { User } = require('../Database/Models');

const RegisterUser = (username, password) => new Promise((resolve, reject) => {
	try {
		const user = new User({
			username,
		});
		user.setPassword(password)
			.then(async () => {
				const newUser = await user.save();
				resolve(newUser);
				MopConsole.info('User', `Added user ${username}`);
			})
			.catch((err) => {
				MopConsole.warn('User', "Couldn't set password of user");
				MopConsole.warn('User', err);
				reject();
			});
	} catch (err) {
		MopConsole.warn('User', "Couldn't register user");
		MopConsole.warn('User', err);
		reject();
	}
});

module.exports = {
	RegisterUser,
};
