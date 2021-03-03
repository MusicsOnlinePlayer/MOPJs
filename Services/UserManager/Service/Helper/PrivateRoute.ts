import { Request, Response, NextFunction } from 'express';

const PrivateRoute = (req: Request, res: Response, next: NextFunction): void => {
	if (req.user) {
		next();
	} else res.sendStatus(401);
};

export default PrivateRoute;
