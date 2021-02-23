import { IUser, User } from 'lib/Models/Users';
import MopConsole from 'lib/MopConsole';

const LogLocation = 'Services.UserManager.Helper.HistoryMusics';

export const RegisterUser = (username: string, password: string): Promise<IUser> =>
	new Promise((resolve, reject) => {
		MopConsole.debug(LogLocation, `A user named ${username} is trying to register an account`);
		try {
			const user = new User({
				username,
			});
			user.setPassword(password, async (err) => {
				if (err) {
					MopConsole.warn(LogLocation, "Couldn't set password of user");
					MopConsole.warn(LogLocation, err);
					reject();
					return;
				}
				const newUser = await user.save();
				resolve(newUser);
				MopConsole.info(LogLocation, `Added user ${username}`);
			});
		} catch (err) {
			MopConsole.warn(LogLocation, "Couldn't register user");
			MopConsole.warn(LogLocation, err);
			reject();
		}
	});
