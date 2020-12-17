import * as logger from 'fluent-logger';
import chalk from 'chalk';
import { MinLogLevel, UseFluentdLogging } from '../Config/MopConf.json';

if (UseFluentdLogging) logger.configure('mop', undefined);

enum LogType {
	DEBUG = -1,
	STD,
	INFO,
	WARN,
	ERROR,
}

export default class MopConsole {
	static debug(Location: string, Message: string) : void{
		MopConsole.log(LogType.DEBUG, Location, chalk.whiteBright(Message));
	}

	static standard(Location: string, Message: string, ClientIp: string = undefined) : void{
		if (process.env.NODE_ENV !== 'test' && UseFluentdLogging) {
			logger.emit('node', {
				Message, Location, LogLevel: 'Standard', ClientIp,
			}, Date.now(), () => { });
		}
		MopConsole.log(LogType.STD, Location, chalk.gray(Message));
	}

	static info(Location: string, Message: string, ClientIp: string = undefined) : void{
		if (process.env.NODE_ENV !== 'test' && UseFluentdLogging) {
			logger.emit('node', {
				Message, Location, LogLevel: 'Info', ClientIp,
			}, Date.now(), () => { });
		}
		MopConsole.log(LogType.INFO, Location, chalk.greenBright(Message));
	}

	static warn(Location: string, Message: string, ClientIp: string = undefined) : void{
		if (process.env.NODE_ENV !== 'test' && UseFluentdLogging) {
			logger.emit('node', {
				Message, Location, LogLevel: 'Warning', ClientIp,
			}, Date.now(), () => { });
		}
		MopConsole.log(LogType.WARN, Location, chalk.yellow(Message));
	}

	static error(Location: string, Message: string, ClientIp: string = undefined) : void{
		if (process.env.NODE_ENV !== 'test' && UseFluentdLogging) {
			logger.emit('node', {
				Message, Location, LogLevel: 'Error', ClientIp,
			}, Date.now(), () => { });
		}
		MopConsole.log(LogType.ERROR, Location, chalk.red(Message));
	}

	static time(Location: string, Message: string) : void{
		console.time(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static timeEnd(Location: string, Message: string) : void{
		console.timeEnd(chalk.bold.cyanBright(`[@ ${Location}] `) + Message);
	}

	static log(logType: LogType, Location: string, Message: string) : void{
		if (logType > MinLogLevel) { MopConsole.classic(`${chalk.italic.grey(`[${new Date(Date.now()).toUTCString()}`)} - ${chalk.italic.grey(`${LogType}]`)}${chalk.bold.cyanBright(`[@ ${Location}] `)}${Message}`); }
	}

	static classic(Message: string) : void{
		/* eslint no-console: "off" */
		if (process.env.NODE_ENV !== 'test') { console.log(Message); }
	}
}
