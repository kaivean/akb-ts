/**
 * @file 日志
 * @author kaivean
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export default class Logger {
    logger: winston.Logger;
    wfLogger: winston.Logger;
    constructor(config: {[propName: string]: any}) {
        const transports = [
            //
            // - Write all logs with level `error` and below to `error.log`
            // - Write all logs with level `info` and below to `combined.log`
            //
            // new winston.transports.File({ filename: 'error.log', level: 'error' }),
            // new winston.transports.File({ filename: 'combined.log' }),

            new DailyRotateFile({
                dirname: config.logger.dir,
                filename: `${config.globals.appname }-%DATE%.log`,
                datePattern: config.logger.dailyRotatePattern.replace('.', ''),
                // zippedArchive: true, '
                maxSize: config.logger.maxsize,
                maxFiles: config.logger.maxFiles || '30d'
            })
        ].concat(config.logger.transports);

        this.logger = winston.createLogger({
            level: config.logger.level,
            silent: !config.logger.enable,
            exitOnError: false,
            format: winston.format.simple(),
            // defaultMeta: {service: 'user-service'},
            transports
        });

        const wfTransports = [
            new DailyRotateFile({
                dirname: config.logger.dir,
                filename: `${config.globals.appname }-%DATE%.log`,
                datePattern: config.logger.dailyRotatePattern.replace('.', ''),
                // zippedArchive: true,
                maxSize: config.logger.maxsize,
                maxFiles: config.logger.maxFiles || '30d'
            })
        ].concat(config.logger.wfTransports);

        this.wfLogger = winston.createLogger({
            level: config.logger.level,
            silent: !config.logger.enable,
            exitOnError: false,
            format: winston.format.simple(),
            // defaultMeta: {service: 'user-service'},
            transports: wfTransports
        });

        //
        // If we're not in production then log to the `console` with the format:
        // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        //
        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
            this.wfLogger.add(new winston.transports.Console({
                format: winston.format.simple(),
            }));
        }
    }

    log(level, args, logger = this.logger) {
        for (const msg of args) {
            if (msg instanceof Error) {
                logger[level](msg.stack || msg.toString());
            }
            else {
                logger[level](msg);
            }
        }
    }

    /**
     * debug logger
     *
     * @param {...Array} args args
     * @public
     */
    debug(...args) {
        this.log('debug', args);
    }

    /**
     * info logger
     *
     * @param {...Array} args args
     * @public
     */
    info(...args) {
        this.log('info', args);
    }

    /**
     * warn logger
     *
     * @param {...Array} args args
     * @public
     */
    warn(...args) {
        this.log('warn', args, this.wfLogger);
    }

    /**
     * error logger
     *
     * @param {...Array} args args
     * @public
     */
    error(...args) {
        this.log('error', args, this.wfLogger);
    }
}
