var { format, createLogger, transports } = require('winston');
const { LOGS_DIR } = require('./constants');

const logger = createLogger({
	level: 'silly',
	format: format.combine(
		format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
		format.printf(
			(log) =>
				`${log.timestamp} - [${log.level.toUpperCase().padEnd(7)}] - ${
					log.message
				}`
		),
		format.colorize(),
		format.align()
	),
	transports: [
		new transports.Console(),
		new transports.File({
			filename: `${LOGS_DIR}/product_service_combined_log.log`,
		}),
		new transports.File({
			filename: `${LOGS_DIR}/product_service_errors_log.log`,
			level: 'error',
		}),
	],
});

function getExceptionalLogger() {
	return createLogger({
		format: format.combine(
			format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
			format.printf((info) => {
				return `${info.timestamp} - [${info.level
					.toUpperCase()
					.padEnd(7)}] - ${info.message}\n`;
			}),
			format.colorize()
		),
		exceptionHandlers: [
			new transports.Console(),
			new transports.File({
				filename: `${LOGS_DIR}/product_service_exceptions_log.log`,
			}),
		],
	});
}

module.exports = {
	getExceptionalLogger,

	customLogger: {
		info: ({ fileName, functionName, context, message }) => {
			logger.info(
				`${fileName}\t| ${functionName}\t| ${context.toUpperCase()}\t | ${message} `
			);
		},
		error: ({ fileName, functionName, context, message, code }) => {
			logger.error(
				`${fileName}\t| ${functionName}\t| ${context.toUpperCase()}\t| ${code}\t | ${message} `
			);
		},
		warn: ({ fileName, functionName, context, message }) => {
			logger.warn(
				`${fileName}\t| ${functionName}\t| ${context.toUpperCase()}\t | ${message} `
			);
		},
		debug: ({ fileName, functionName, context, message }) => {
			logger.debug(
				`${fileName}\t| ${functionName}\t| ${context.toUpperCase()}\t | ${message} `
			);
		},
	},
};
