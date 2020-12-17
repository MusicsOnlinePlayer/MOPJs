import { NextFunction, Response, Request } from 'express';
import MopConsole from '../Tools/MopConsole';
import { EnsureAuth as EnsureAuthConfig } from '../Config/MopConf.json';

// eslint-disable-next-line import/prefer-default-export
export const EnsureAuth = (req: Request, res: Response, next: NextFunction) : Response | void => {
	// @ts-ignore for req.isAuthenticated()
	if (req.isAuthenticated() || !EnsureAuthConfig) {
		return next();
	}

	MopConsole.warn('Middleware.Auth', 'User not authenticated');
	return res.sendStatus(401);
};
