const MopConsole = require('../Tools/MopConsole');
const { EnsureAuth: EnsureAuthConfig } = require('../Config/MopConf.json');

const EnsureAuth = (req, res, next) => {
	if (req.isAuthenticated() || !EnsureAuthConfig) {
		return next();
	}

	MopConsole.warn('Middleware.Auth', 'User not authentificated');
	return res.sendStatus(401);
};

module.exports = {
	EnsureAuth,
};
