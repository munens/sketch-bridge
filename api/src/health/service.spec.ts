import {HealthService} from './service';
import {HealthRepository} from './repository';

describe('HealthService', () => {
	let service: HealthService;
	let mockRepository: jest.Mocked<HealthRepository>;

	beforeEach(() => {
		mockRepository = {
			pingDatabase: jest.fn(),
			healthCheck: jest.fn(),
			performDetailedHealthCheck: jest.fn(),
		} as any;

		service = new HealthService(mockRepository);
	});

	describe('performHealthCheck', () => {
		it('should return healthy status when all checks pass', async () => {
			// Mock healthy memory usage (below 85% threshold)
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			expect(result.status).toBe('healthy');
			expect(result.timestamp).toBeDefined();
			expect(result.uptime).toBeGreaterThan(0);
			expect(result.version).toBeDefined();
			expect(result.environment).toBeDefined();
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.checks.memory).toBeDefined();
			expect(result.checks.disk).toBeUndefined(); // Disk check not implemented
			expect(result.checks.database).toBeDefined();
		});

		it('should return degraded status when memory usage is high', async () => {
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			// Mock high memory usage
			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 90 * 1024 * 1024,   // 90MB (90% usage)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			const result = await service.performHealthCheck();

			expect(result.status).toBe('degraded');
			expect(result.checks.memory?.status).toBe('degraded');
			expect(result.checks.memory?.percentage).toBeGreaterThan(85);

			// Restore original function
			process.memoryUsage = originalMemoryUsage;
		});

		it('should include correct metadata in health check result', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
			expect(result.version).toBeDefined();
			expect(result.environment).toBeDefined();
			expect(typeof result.uptime).toBe('number');
			expect(typeof result.responseTime).toBe('number');
		});

		it('should handle errors gracefully and return unhealthy status', async () => {
			// Mock process.memoryUsage to throw an error
			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockImplementation(() => {
					throw new Error('Memory check failed');
				})
			});

			// Mock database to fail as well
			mockRepository.pingDatabase.mockRejectedValue(new Error('Database connection failed'));

			const result = await service.performHealthCheck();

			expect(result.status).toBe('unhealthy');
			expect(result.checks.memory).toBeUndefined(); // Memory check failed, so not included
			expect(result.checks.database).toBeDefined(); // Database check failed but still returns result
			expect(result.checks.database?.status).toBe('unhealthy');
			expect(result.checks.database?.error).toBe('Database connection failed');

			// Restore original function
			process.memoryUsage = originalMemoryUsage;
		});
	});

	describe('getSimpleStatus', () => {
		it('should return simple status when health check succeeds', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.getSimpleStatus();

			expect(result.status).toBe('healthy');
			expect(result.timestamp).toBeDefined();
			expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});

		it('should return unhealthy status when health check fails', async () => {
			// Mock performHealthCheck to throw an error
			jest.spyOn(service, 'performHealthCheck').mockRejectedValue(new Error('Service unavailable'));

			const result = await service.getSimpleStatus();

			expect(result.status).toBe('unhealthy');
			expect(result.timestamp).toBeDefined();
		});
	});

	describe('memory check', () => {
		it('should return healthy status for normal memory usage', async () => {
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			const result = await service.performHealthCheck();

			expect(result.checks.memory?.status).toBe('healthy');
			expect(result.checks.memory?.percentage).toBe(50);
			expect(result.checks.memory?.used).toBe(50 * 1024 * 1024);
			expect(result.checks.memory?.total).toBe(100 * 1024 * 1024);
			expect(result.checks.memory?.threshold).toBe(85);

			process.memoryUsage = originalMemoryUsage;
		});

		it('should return degraded status for high memory usage', async () => {
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 95 * 1024 * 1024,   // 95MB (95% usage)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			const result = await service.performHealthCheck();

			expect(result.checks.memory?.status).toBe('degraded');
			expect(result.checks.memory?.percentage).toBe(95);

			process.memoryUsage = originalMemoryUsage;
		});
	});

	describe('disk check', () => {
		it('should not include disk check in current implementation', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			// Disk check is not implemented in current version
			expect(result.checks.disk).toBeUndefined();
		});
	});

	describe('database check', () => {
		it('should return healthy status for database connectivity', async () => {
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 25
			});

			const result = await service.performHealthCheck();

			expect(result.checks.database?.status).toBe('healthy');
			expect(result.checks.database?.responseTime).toBe(25);
			expect(result.checks.database?.error).toBeUndefined();
		});

		it('should return unhealthy status when database ping fails', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: false,
				responseTime: 5000,
				error: 'Connection timeout'
			});

			const result = await service.performHealthCheck();

			expect(result.status).toBe('unhealthy');
			expect(result.checks.database?.status).toBe('unhealthy');
			expect(result.checks.database?.error).toBe('Connection timeout');
		});

		it('should work without repository', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			const serviceWithoutRepo = new HealthService();

			const result = await serviceWithoutRepo.performHealthCheck();

			expect(result.status).toBe('healthy');
			expect(result.checks.database?.status).toBe('healthy');
			expect(result.checks.database?.responseTime).toBe(0);
		});
	});

	describe('overall status determination', () => {
		it('should return healthy when all checks are healthy', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			// With default mocks, all should be healthy
			expect(result.status).toBe('healthy');
		});

		it('should return degraded when memory is degraded but others are healthy', async () => {
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024,
					heapUsed: 90 * 1024 * 1024, // 90% - degraded
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			const result = await service.performHealthCheck();

			expect(result.status).toBe('degraded');

			process.memoryUsage = originalMemoryUsage;
		});
	});

	describe('error handling', () => {
		it('should handle memory check errors', async () => {
			const originalMemoryUsage = process.memoryUsage;
			Object.assign(process, {
				memoryUsage: jest.fn().mockImplementation(() => {
					throw new Error('Memory access failed');
				})
			});

			// Mock database to succeed so we can see memory failure effect
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			expect(result.status).toBe('unhealthy'); // Memory check failed, so overall is unhealthy
			expect(result.checks.memory).toBeUndefined(); // Memory check failed, so not included
			expect(result.checks.database).toBeDefined(); // Database check succeeded

			process.memoryUsage = originalMemoryUsage;
		});

		it('should handle disk check errors (disk check not implemented)', async () => {
			// Mock healthy memory usage
			Object.assign(process, {
				memoryUsage: jest.fn().mockReturnValue({
					heapTotal: 100 * 1024 * 1024, // 100MB
					heapUsed: 50 * 1024 * 1024,   // 50MB (50% usage - healthy)
					external: 0,
					arrayBuffers: 0,
					rss: 0
				})
			});

			// Mock database to succeed
			mockRepository.pingDatabase.mockResolvedValue({
				success: true,
				responseTime: 50
			});

			const result = await service.performHealthCheck();

			// Since disk check is not implemented, it should still be healthy
			expect(result.status).toBe('healthy');
			expect(result.checks.disk).toBeUndefined(); // Disk check not implemented
		});
	});
}); 