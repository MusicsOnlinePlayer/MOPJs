const chalk = require('chalk');

module.exports = class MopConsole {
	static info(Location, Message) {
		MopConsole.log(Location, chalk.cyan(Message));
	}

	static warn(Location, Message) {
		MopConsole.log(Location, chalk.yellow(Message));
	}

	static error(Location, Message) {
		MopConsole.log(Location, chalk.red(Message));
	}

	static time(Location, Message) {
		console.time(chalk.bold.magenta(`[@ ${Location}] `) + Message);
	}

	static timeEnd(Location, Message) {
		console.timeEnd(chalk.bold.magenta(`[@ ${Location}] `) + Message);
	}

	static log(Location, Message) {
		MopConsole.classic(chalk.bold.magenta(`[@ ${Location}] `) + Message);
	}

	static classic(Message) {
		/* eslint no-console: "off" */
		console.log(Message);
	}
};
