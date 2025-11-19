import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';

export const logger = winston.createLogger({
	level: logLevel,
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.errors({ stack: true }),
		winston.format.splat(),
		winston.format.json()
	),
	defaultMeta: { service: 'sketch-bridge-socket' },
	transports: [
		new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
		new winston.transports.File({ filename: 'logs/combined.log' })
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.simple()
		)
	}));
}

export const logSocketEvent = (event: string, data?: any) => {
	logger.info(`[SOCKET] ${event}`, data);
};

export const logSocketError = (error: Error, context?: any) => {
	logger.error('[SOCKET ERROR]', {
		message: error.message,
		stack: error.stack,
		...context
	});
};

export const logSocketSuccess = (message: string, data?: any) => {
	logger.info(`[SOCKET SUCCESS] ${message}`, data);
};

