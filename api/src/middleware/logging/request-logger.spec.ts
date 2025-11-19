import {Request, Response, NextFunction} from 'express';
import {requestLogger, generateRequestId} from './request-logger';
import {logger} from './logger';

// Mock the logger
jest.mock('./logger', () => ({
	logger: {
		info: jest.fn(),
		error: jest.fn()
	}
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('generateRequestId', () => {
	it('should generate a unique request ID', () => {
		const id1 = generateRequestId();
		const id2 = generateRequestId();
		
		expect(typeof id1).toBe('string');
		expect(typeof id2).toBe('string');
		expect(id1).not.toBe(id2);
		expect(id1.length).toBeGreaterThan(10);
	});
});

describe('requestLogger', () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: NextFunction;
	let originalSend: jest.Mock;
	let originalJson: jest.Mock;
	let originalEnd: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		
		originalSend = jest.fn();
		originalJson = jest.fn();
		originalEnd = jest.fn();

		mockRequest = {
			method: 'GET',
			url: '/test',
			headers: {
				'user-agent': 'test-agent'
			},
			ip: '127.0.0.1',
			query: {}
		};

		mockResponse = {
			send: originalSend,
			json: originalJson,
			end: originalEnd,
			statusCode: 200,
			headersSent: false
		};

		mockNext = jest.fn();
	});

	it('should attach requestId to request when not provided in headers', () => {
		const middleware = requestLogger();
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		expect(mockRequest.requestId).toBeDefined();
		expect(typeof mockRequest.requestId).toBe('string');
		expect(mockNext).toHaveBeenCalled();
	});

	it('should use existing requestId from headers', () => {
		const existingRequestId = 'existing-request-id';
		mockRequest.headers = {
			...mockRequest.headers,
			'x-request-id': existingRequestId
		};

		const middleware = requestLogger();
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		expect(mockRequest.requestId).toBe(existingRequestId);
		expect(mockNext).toHaveBeenCalled();
	});

	it('should log incoming request', () => {
		const middleware = requestLogger();
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
			requestId: expect.any(String),
			method: 'GET',
			url: '/test',
			userAgent: 'test-agent',
			ip: '127.0.0.1',
			timestamp: expect.any(String)
		}));
	});

	it('should log request with query parameters', () => {
		mockRequest.query = { page: '1', limit: '10' };
		const middleware = requestLogger();
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		expect(mockLogger.info).toHaveBeenCalledWith('Incoming request', expect.objectContaining({
			query: { page: '1', limit: '10' }
		}));
	});

	it('should override response.send and log completion', () => {
		const startTime = Date.now();
		jest.spyOn(Date, 'now')
			.mockReturnValueOnce(startTime) // Initial call
			.mockReturnValueOnce(startTime + 100); // Duration calculation

		const middleware = requestLogger();
		const responseBody = { success: true };
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Simulate response
		mockResponse.send!(responseBody);
		
		expect(originalSend).toHaveBeenCalledWith(responseBody);
		expect(mockLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
			requestId: expect.any(String),
			method: 'GET',
			url: '/test',
			statusCode: 200,
			duration: 100,
			responseSize: expect.any(Number),
			timestamp: expect.any(String)
		}));
	});

	it('should override response.json and log completion', () => {
		const startTime = Date.now();
		jest.spyOn(Date, 'now')
			.mockReturnValueOnce(startTime) // Initial call
			.mockReturnValueOnce(startTime + 150); // Duration calculation

		const middleware = requestLogger();
		const responseBody = { data: 'test' };
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Simulate response
		mockResponse.json!(responseBody);
		
		expect(originalJson).toHaveBeenCalledWith(responseBody);
		expect(mockLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
			duration: 150,
			responseSize: expect.any(Number)
		}));
	});

	it('should log error for failed requests', () => {
		const startTime = Date.now();
		jest.spyOn(Date, 'now')
			.mockReturnValueOnce(startTime) // Initial call
			.mockReturnValueOnce(startTime + 200); // Duration calculation

		const middleware = requestLogger();
		mockResponse.statusCode = 500;
		const errorResponse = { error: 'Internal server error' };
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Simulate error response
		mockResponse.send!(errorResponse);
		
		expect(mockLogger.error).toHaveBeenCalledWith('Request failed', expect.objectContaining({
			requestId: expect.any(String),
			method: 'GET',
			url: '/test',
			statusCode: 500,
			duration: 200,
			errorResponse: errorResponse
		}));
	});

	it('should handle response.end without body', () => {
		const startTime = Date.now();
		jest.spyOn(Date, 'now')
			.mockReturnValueOnce(startTime) // Initial call
			.mockReturnValueOnce(startTime + 50); // Duration calculation

		const middleware = requestLogger();
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Simulate response.end() without body
		mockResponse.end!();
		
		expect(originalEnd).toHaveBeenCalled();
		expect(mockLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
			duration: 50,
			responseSize: 0
		}));
	});

	it('should handle response.end with body', () => {
		const startTime = Date.now();
		jest.spyOn(Date, 'now')
			.mockReturnValueOnce(startTime) // Initial call
			.mockReturnValueOnce(startTime + 75); // Duration calculation

		const middleware = requestLogger();
		const responseBody = 'simple text response';
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Simulate response.end() with body
		mockResponse.end!(responseBody);
		
		expect(originalEnd).toHaveBeenCalledWith(responseBody);
		expect(mockLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({
			duration: 75,
			responseSize: expect.any(Number)
		}));
	});

	it('should not log response multiple times', () => {
		const middleware = requestLogger();
		mockResponse.headersSent = true; // Simulate headers already sent
		
		middleware(mockRequest as Request, mockResponse as Response, mockNext);
		
		// Try to send response after headers are sent
		mockResponse.end!();
		
		expect(originalEnd).toHaveBeenCalled();
		// Should not log anything since headers were already sent
		expect(mockLogger.info).toHaveBeenCalledTimes(1); // Only the initial request log
	});
}); 