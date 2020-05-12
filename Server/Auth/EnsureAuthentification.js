const MopConsole = require('../Tools/MopConsole');

const EnsureAuth = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	MopConsole.warn('Auth', 'User not authentificated');
	return res.sendStatus(401);
};

module.exports = {
	EnsureAuth,
};
