import {NextFunction, Request, Response} from 'express';
import {HttpError, InternalServerError} from '../model/errors';
import {logger} from './logging/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response, _2: NextFunction): Response<any, Record<string, any>> {

	const requestId = req.requestId || 'unknown';
	const operation = (err as any).operation || 'unknown';
	
	logger.error('Unhandled error', {
		requestId,
		operation,
		error: {
			name: err.name,
			message: err.message,
			stack: err.stack,
			statusCode: (err as any).statusCode
		},
		request: {
			method: req.method,
			url: req.url,
			params: (err as any).params,
			body: req.body,
			userAgent: req.headers['user-agent'],
			ip: req.ip
		},
		timestamp: new Date().toISOString()
	});

	if (err instanceof HttpError) {
		return res.status(err.statusCode).json({
			success: false,
			error: {
				name: err.name,
				message: err.message,
				statusCode: err.statusCode
			},
			meta: {
				requestId,
				timestamp: new Date().toISOString()
			}
		});
	}

	const unknownError = new InternalServerError(null, err, err.stack ?? err.toString());

	return res.status(unknownError.statusCode).json({
		success: false,
		error: {
			name: unknownError.name,
			message: unknownError.message,
			statusCode: unknownError.statusCode
		},
		meta: {
			requestId,
			timestamp: new Date().toISOString()
		}
	});
}
