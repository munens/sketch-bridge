import winston from 'winston';
import path from 'path';

const logDir = path.join(process.cwd(), 'logs');

import fs from 'fs';
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

export const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
	format: winston.format.combine(
		winston.format.timestamp({
			format: 'YYYY-MM-DD HH:mm:ss'
		}),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	defaultMeta: {
		service: 'cheza-api',
		version: process.env.npm_package_version || '1.0.0',
		environment: process.env.NODE_ENV || 'development'
	},
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
					const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
					return `${timestamp} [${service}] ${level}: ${message} ${metaStr}`;
				})
			)
		}),
		
		new winston.transports.File({
			filename: path.join(logDir, 'error.log'),
			level: 'error',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			)
		}),
		
		new winston.transports.File({
			filename: path.join(logDir, 'combined.log'),
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json()
			)
		})
	],
	
	exceptionHandlers: [
		new winston.transports.File({
			filename: path.join(logDir, 'exceptions.log')
		})
	],
	
	rejectionHandlers: [
		new winston.transports.File({
			filename: path.join(logDir, 'rejections.log')
		})
	]
});

if (process.env.NODE_ENV !== 'production') {
	logger.clear();
	logger.add(new winston.transports.Console({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp({
				format: 'HH:mm:ss'
			}),
			winston.format.printf(({ timestamp, level, message, service, requestId, operation, ...meta }) => {
				const context = [];
				if (requestId) context.push(`[${requestId}]`);
				if (operation) context.push(`[${operation}]`);
				
				const contextStr = context.length ? context.join(' ') + ' ' : '';
				const metaStr = Object.keys(meta).length && Object.keys(meta).some(key => !['service', 'version', 'environment'].includes(key))
					? '\n' + JSON.stringify(meta, null, 2)
					: '';
				
				return `${timestamp} ${level}: ${contextStr}${message}${metaStr}`;
			})
		)
	}));
}

export default logger; 