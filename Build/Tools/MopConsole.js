"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const logger = tslib_1.__importStar(require("fluent-logger"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const MopConf_json_1 = require("../Config/MopConf.json");
if (MopConf_json_1.UseFluentdLogging)
    logger.configure('mop', undefined);
var LogType;
(function (LogType) {
    LogType[LogType["DEBUG"] = -1] = "DEBUG";
    LogType[LogType["STD"] = 0] = "STD";
    LogType[LogType["INFO"] = 1] = "INFO";
    LogType[LogType["WARN"] = 2] = "WARN";
    LogType[LogType["ERROR"] = 3] = "ERROR";
})(LogType || (LogType = {}));
class MopConsole {
    static debug(Location, Message) {
        MopConsole.log(LogType.DEBUG, Location, chalk_1.default.whiteBright(Message));
    }
    static standard(Location, Message, ClientIp = undefined) {
        if (process.env.NODE_ENV !== 'test' && MopConf_json_1.UseFluentdLogging) {
            logger.emit('node', {
                Message, Location, LogLevel: 'Standard', ClientIp,
            }, Date.now(), () => { });
        }
        MopConsole.log(LogType.STD, Location, chalk_1.default.gray(Message));
    }
    static info(Location, Message, ClientIp = undefined) {
        if (process.env.NODE_ENV !== 'test' && MopConf_json_1.UseFluentdLogging) {
            logger.emit('node', {
                Message, Location, LogLevel: 'Info', ClientIp,
            }, Date.now(), () => { });
        }
        MopConsole.log(LogType.INFO, Location, chalk_1.default.greenBright(Message));
    }
    static warn(Location, Message, ClientIp = undefined) {
        if (process.env.NODE_ENV !== 'test' && MopConf_json_1.UseFluentdLogging) {
            logger.emit('node', {
                Message, Location, LogLevel: 'Warning', ClientIp,
            }, Date.now(), () => { });
        }
        MopConsole.log(LogType.WARN, Location, chalk_1.default.yellow(Message));
    }
    static error(Location, Message, ClientIp = undefined) {
        if (process.env.NODE_ENV !== 'test' && MopConf_json_1.UseFluentdLogging) {
            logger.emit('node', {
                Message, Location, LogLevel: 'Error', ClientIp,
            }, Date.now(), () => { });
        }
        MopConsole.log(LogType.ERROR, Location, chalk_1.default.red(Message));
    }
    static time(Location, Message) {
        console.time(chalk_1.default.bold.cyanBright(`[@ ${Location}] `) + Message);
    }
    static timeEnd(Location, Message) {
        console.timeEnd(chalk_1.default.bold.cyanBright(`[@ ${Location}] `) + Message);
    }
    static getLogType(logType) {
        return Object.values(LogType).filter((value) => typeof value === 'string')[logType + 1];
    }
    static log(logType, Location, Message) {
        const d = new Date(Date.now()).toUTCString();
        if (logType > MopConf_json_1.MinLogLevel) {
            MopConsole.classic(`[${chalk_1.default.italic.grey(d)} - ${chalk_1.default.italic.grey(MopConsole.getLogType(logType))}] ${chalk_1.default.bold.cyanBright(`[@ ${Location}] `)}${Message} `);
        }
    }
    static classic(Message) {
        /* eslint no-console: "off" */
        if (process.env.NODE_ENV !== 'test') {
            console.log(Message);
        }
    }
}
exports.default = MopConsole;
