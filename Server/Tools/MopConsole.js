const chalk = require('chalk');

module.exports = class MopConsole {
	static info(Location, Message) {
		MopConsole.log('INFO', Location, chalk.greenBright(Message));
	}

	static warn(Location, Message) {
		MopConsole.log('WARN', Location, chalk.yellow(Message));
	}

	static error(Location, Message) {
		MopConsole.log('ERROR', Location, chalk.red(Message));
	}

	static time(Location, Message) {
		console.time(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static timeEnd(Location, Message) {
		console.timeEnd(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static log(LogType, Location, Message) {
		MopConsole.classic(`${chalk.italic.grey(`[${new Date(Date.now()).toUTCString()}`)} - ${chalk.italic.grey(`${LogType}]`)}${chalk.bold.cyanBright(`[@ ${Location}] `)}${Message}`);
	}

	static classic(Message) {
		/* eslint no-console: "off" */
		console.log(Message);
	}
};
