const chalk = require('chalk');
const { MinLogLevel } = require('../Config/MopConf.json');

module.exports = class MopConsole {
	static standard(Location, Message) {
		MopConsole.log('STD', Location, chalk.gray(Message), 0);
	}

	static info(Location, Message) {
		MopConsole.log('INFO', Location, chalk.greenBright(Message), 1);
	}

	static warn(Location, Message) {
		MopConsole.log('WARN', Location, chalk.yellow(Message), 2);
	}

	static error(Location, Message) {
		MopConsole.log('ERROR', Location, chalk.red(Message), 3);
	}

	static time(Location, Message) {
		console.time(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static timeEnd(Location, Message) {
		console.timeEnd(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static log(LogType, Location, Message, LogLevel) {
		if (LogLevel > MinLogLevel) { MopConsole.classic(`${chalk.italic.grey(`[${new Date(Date.now()).toUTCString()}`)} - ${chalk.italic.grey(`${LogType}]`)}${chalk.bold.cyanBright(`[@ ${Location}] `)}${Message}`); }
	}

	static classic(Message) {
		/* eslint no-console: "off" */
		if (process.env.NODE_ENV !== 'test') { console.log(Message); }
	}
};
