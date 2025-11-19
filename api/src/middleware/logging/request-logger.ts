import {Request, Response, NextFunction} from 'express';
import {logger} from './logger';

// Extend Express Request interface to include requestId
declare global {
	namespace Express {
		interface Request {
			requestId?: string;
		}
	}
}

export function generateRequestId(): string {
	return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function requestLogger() {
	return (req: Request, res: Response, next: NextFunction) => {
		const requestId = (req.headers['x-request-id'] as string) || generateRequestId();
		const startTime = Date.now();
		
		// Attach requestId to request for use in controllers
		req.requestId = requestId;
		
		// Log incoming request
		logger.info('Incoming request', {
			requestId,
			method: req.method,
			url: req.url,
			userAgent: req.headers['user-agent'],
			ip: req.ip,
			query: Object.keys(req.query).length ? req.query : undefined,
			timestamp: new Date().toISOString()
		});
		
		// Store original methods
		const originalSend = res.send;
		const originalJson = res.json;
		const originalEnd = res.end;
		
		// Override res.send to capture response data
		res.send = function(body) {
			logResponse(body);
			return originalSend.call(this, body);
		};
		
		// Override res.json to capture response data
		res.json = function(body) {
			logResponse(body);
			return originalJson.call(this, body);
		};
		
		// Override res.end as fallback
		res.end = function(...args: any[]) {
			const [chunk] = args;
			if (chunk && !res.headersSent) {
				logResponse(chunk);
			} else if (!res.headersSent) {
				logResponse();
			}
			return originalEnd.apply(this, args);
		} as typeof originalEnd;
		
		function logResponse(responseBody?: any) {
			const duration = Date.now() - startTime;
			const responseSize = responseBody ? JSON.stringify(responseBody).length : 0;
			
			const logLevel = res.statusCode >= 400 ? 'error' : 'info';
			const message = res.statusCode >= 400 ? 'Request failed' : 'Request completed';
			
			logger[logLevel](message, {
				requestId,
				method: req.method,
				url: req.url,
				statusCode: res.statusCode,
				duration,
				responseSize,
				timestamp: new Date().toISOString(),
				...(res.statusCode >= 400 && responseBody && {
					errorResponse: responseBody
				})
			});
		}
		
		next();
	};
} 