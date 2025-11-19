import {errorHandler} from './error-handler';
import {BadRequestError, HttpError, InternalServerError} from '../model/errors';
import {NextFunction, Request, Response} from 'express';
import {HttpStatusMessage} from '../model/errors/http-status-message';

// Mock the logger
jest.mock('../middleware/logging/logger', () => ({
	logger: {
		error: jest.fn()
	}
}));

describe('errorHandler', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockRequest = {
			requestId: 'test-request-id',
			method: 'GET',
			url: '/test',
			body: {test: 'data'},
			headers: {
				'user-agent': 'test-agent'
			},
			ip: '127.0.0.1'
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		mockNext = jest.fn();

		// Clear all mocks
		jest.clearAllMocks();
	});

	describe('HttpError handling', () => {
		it('should handle BadRequestError correctly', () => {
			const error = new BadRequestError('Invalid input');
			(error as any).operation = 'testOperation';

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(400);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					name: 'BadRequestError',
					message: 'Invalid input',
					statusCode: 400
				},
				meta: {
					requestId: 'test-request-id',
					timestamp: expect.any(String)
				}
			});
		});

		it('should handle custom HttpError correctly', () => {
			const error = new HttpError({
				statusCode: 403,
				statusMessage: HttpStatusMessage.FORBIDDEN,
				message: 'Forbidden error'
			});

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(403);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					name: 'Error',
					message: 'Forbidden error',
					statusCode: 403
				},
				meta: {
					requestId: 'test-request-id',
					timestamp: expect.any(String)
				}
			});
		});
	});

	describe('Non-HttpError handling', () => {
		it('should convert unknown errors to InternalServerError', () => {
			const error = new Error('Something went wrong');

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					name: 'InternalServerError',
					message: null,
					statusCode: 500
				},
				meta: {
					requestId: 'test-request-id',
					timestamp: expect.any(String)
				}
			});
		});

		it('should handle errors without requestId', () => {
			const error = new BadRequestError('Invalid input');
			mockRequest.requestId = undefined;

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			expect(mockResponse.json).toHaveBeenCalledWith({
				success: false,
				error: {
					name: 'BadRequestError',
					message: 'Invalid input',
					statusCode: 400
				},
				meta: {
					requestId: 'unknown',
					timestamp: expect.any(String)
				}
			});
		});

		it('should handle errors without operation', () => {
			const error = new Error('Test error');

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			// Should not throw and should use 'unknown' as default operation
			expect(mockResponse.status).toHaveBeenCalledWith(500);
		});
	});

	describe('logging', () => {
		it('should log error details', () => {
			const {logger} = require('../middleware/logging/logger');
			const error = new BadRequestError('Invalid input');
			(error as any).operation = 'testOperation';
			
			// Use Object.defineProperty to set the stack since it's read-only
			Object.defineProperty(error, 'stack', {
				value: 'Error: Invalid input\n    at test location',
				writable: true,
				configurable: true
			});

			errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

			expect(logger.error).toHaveBeenCalledWith('Unhandled error', {
				requestId: 'test-request-id',
				operation: 'testOperation',
				error: {
					name: 'BadRequestError',
					message: 'Invalid input',
					stack: expect.any(String),
					statusCode: 400
				},
				request: {
					method: 'GET',
					url: '/test',
					params: undefined,
					body: {test: 'data'},
					userAgent: 'test-agent',
					ip: '127.0.0.1'
				},
				timestamp: expect.any(String)
			});
		});
	});
}); 