import {logger} from './logger';

export interface ControllerContext {
	requestId: string;
	operation: string;
	params?: any;
	body?: any;
	query?: any;
	duration: number;
}

export interface SuccessContext {
	requestId: string;
	operation: string;
	duration: number;
	data?: any;
	resultCount?: number;
}

export function logControllerError(error: Error, context: ControllerContext) {
	logger.error('Controller error', {
		requestId: context.requestId,
		operation: context.operation,
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack,
			statusCode: (error as any).statusCode
		},
		request: {
			params: context.params,
			body: context.body,
			query: context.query
		},
		duration: context.duration,
		timestamp: new Date().toISOString()
	});
}

export function logControllerSuccess(message: string, context: SuccessContext) {
	logger.info('Controller success', {
		message,
		requestId: context.requestId,
		operation: context.operation,
		duration: context.duration,
		resultCount: context.resultCount ?? (Array.isArray(context.data) ? context.data.length : undefined),
		timestamp: new Date().toISOString()
	});
}

export function logServiceCall(serviceName: string, methodName: string, context: {
	requestId: string;
	params?: any;
}) {
	logger.debug('Service call', {
		service: serviceName,
		method: methodName,
		requestId: context.requestId,
		params: context.params,
		timestamp: new Date().toISOString()
	});
}

export function logDatabaseQuery(query: string, context: {
	requestId?: string;
	duration?: number;
	table?: string;
}) {
	logger.debug('Database query', {
		query: query.replace(/\s+/g, ' ').trim(),
		table: context.table,
		duration: context.duration,
		requestId: context.requestId,
		timestamp: new Date().toISOString()
	});
} 