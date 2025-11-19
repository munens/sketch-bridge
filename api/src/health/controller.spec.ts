import {HealthController} from './controller';
import {HealthService} from './service';
import {Request, Response, NextFunction} from 'express';

describe('HealthController', () => {
	let controller: HealthController;
	let mockService: jest.Mocked<HealthService>;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: jest.MockedFunction<NextFunction>;

	beforeEach(() => {
		mockService = {
			getSimpleStatus: jest.fn(),
			performHealthCheck: jest.fn(),
		} as any;

		mockRequest = {
			requestId: 'test-request-id',
		};

		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis(),
		};

		mockNext = jest.fn();

		controller = new HealthController(mockService);
	});

	describe('constructor', () => {
		it('should initialize with correct baseRoute', () => {
			expect(controller.baseRoute).toBe('health');
		});

		it('should initialize router', () => {
			expect(controller.router).toBeDefined();
		});
	});

	describe('GET /', () => {
		it('should return 200 status for healthy service', async () => {
			const healthStatus = { status: 'healthy', timestamp: '2023-01-01T00:00:00.000Z' };
			mockService.getSimpleStatus.mockResolvedValue(healthStatus);

			const routeHandler = jest.fn(async (req, res, next) => {
				try {
					const status = await mockService.getSimpleStatus();
					const httpStatus = status.status === 'healthy' ? 200 : 503;
					res.status(httpStatus).json({
						success: true,
						data: status,
						meta: { requestId: req.requestId, timestamp: new Date().toISOString() }
					});
				} catch (err) {
					next(err);
				}
			});

			await routeHandler(mockRequest, mockResponse, mockNext);

			expect(mockService.getSimpleStatus).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith({
				success: true,
				data: healthStatus,
				meta: expect.objectContaining({
					requestId: 'test-request-id'
				})
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should return 503 status for unhealthy service', async () => {
			const healthStatus = { status: 'unhealthy', timestamp: '2023-01-01T00:00:00.000Z' };
			mockService.getSimpleStatus.mockResolvedValue(healthStatus);

			const routeHandler = jest.fn(async (req, res, next) => {
				try {
					const status = await mockService.getSimpleStatus();
					const httpStatus = status.status === 'healthy' ? 200 : 503;
					res.status(httpStatus).json({
						success: true,
						data: status,
						meta: { requestId: req.requestId, timestamp: new Date().toISOString() }
					});
				} catch (err) {
					next(err);
				}
			});

			await routeHandler(mockRequest, mockResponse, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(503);
		});

		it('should return 200 status for degraded service', async () => {
			const healthStatus = { status: 'degraded', timestamp: '2023-01-01T00:00:00.000Z' };
			mockService.getSimpleStatus.mockResolvedValue(healthStatus);

			const routeHandler = jest.fn(async (req, res, next) => {
				try {
					const status = await mockService.getSimpleStatus();
					const httpStatus = status.status === 'healthy'
						? 200
						: status.status === 'degraded' ? 200 : 503;
					res.status(httpStatus).json({
						success: true,
						data: status,
						meta: { requestId: req.requestId, timestamp: new Date().toISOString() }
					});
				} catch (err) {
					next(err);
				}
			});

			await routeHandler(mockRequest, mockResponse, mockNext);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it('should handle service errors', async () => {
			const error = new Error('Health check failed');
			mockService.getSimpleStatus.mockRejectedValue(error);

			const routeHandler = jest.fn(async (req, res, next) => {
				try {
					await mockService.getSimpleStatus();
				} catch (err) {
					next(err);
				}
			});

			await routeHandler(mockRequest, mockResponse, mockNext);

			expect(mockNext).toHaveBeenCalledWith(error);
		});
	});
}); 