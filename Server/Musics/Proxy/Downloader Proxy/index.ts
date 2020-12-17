/* eslint-disable import/prefer-default-export */
import { CreateUser, User } from '@mopjs/dzdownloadernode';

let MyUser : User;

export const GetDownloaderUser = async () : Promise<User> => {
	if (MyUser) {
		return MyUser;
	}
	MyUser = await CreateUser(process.env.MOP_DEEZER_ARL);
	return MyUser;
};
