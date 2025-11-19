import {HealthRepository} from './repository';
import {Knex} from 'knex';

describe('HealthRepository', () => {
	let repository: HealthRepository;
	let mockKnex: jest.Mocked<Knex>;

	beforeEach(() => {
		mockKnex = {
			raw: jest.fn(),
			client: {
				pool: {
					numUsed: jest.fn().mockReturnValue(2),
					numFree: jest.fn().mockReturnValue(8),
					numPendingAcquires: jest.fn().mockReturnValue(0),
					numPendingCreates: jest.fn().mockReturnValue(0)
				}
			}
		} as any;

		repository = new HealthRepository(mockKnex);
	});

	describe('pingDatabase', () => {
		it('should return success when database is accessible', async () => {
			mockKnex.raw.mockImplementation((() =>
				new Promise(resolve => setTimeout(() => resolve({ rows: [{ result: 1 }] }), 10))
		) as any);

			const result = await repository.pingDatabase();

			expect(result.success).toBe(true);
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.error).toBeUndefined();
			expect(mockKnex.raw).toHaveBeenCalledWith('SELECT 1');
		});

		it('should return failure when database is not accessible', async () => {
			const dbError = new Error('Connection refused');
			mockKnex.raw.mockImplementation((() =>
				new Promise((_, reject) => setTimeout(() => reject(dbError), 10))
		) as any);

			const result = await repository.pingDatabase();

			expect(result.success).toBe(false);
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.error).toBe('Connection refused');
		});

		it('should handle timeout errors', async () => {
			const timeoutError = new Error('Query timeout');
			timeoutError.name = 'TimeoutError';
			mockKnex.raw.mockRejectedValue(timeoutError);

			const result = await repository.pingDatabase();

			expect(result.success).toBe(false);
			expect(result.error).toBe('Query timeout');
		});
	});

	describe('healthCheck', () => {
		it('should return healthy status when database is accessible', async () => {
			mockKnex.raw
				.mockImplementationOnce((() =>
					new Promise(resolve => setTimeout(() => resolve({ rows: [{ health_check: 1 }] }), 10))
			) as any) 
				.mockImplementationOnce((() =>
					new Promise(resolve => setTimeout(() => resolve({ rows: [{ version: 'PostgreSQL 13.0' }] }), 10))
			) as any) 
				.mockImplementationOnce((() =>
					new Promise(resolve => setTimeout(() => resolve({ rows: [{ connection_count: '5' }] }), 10))
			) as any); 

			const result = await repository.healthCheck();

			expect(result.status).toBe('healthy');
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.version).toBe('PostgreSQL 13.0');
			expect(result.connectionCount).toBe(5);
		});

		it('should return healthy status without version and connection count', async () => {
			mockKnex.raw
				.mockResolvedValueOnce({ rows: [{ health_check: 1 }] }) 
				.mockRejectedValueOnce(new Error('Version query failed')) 
				.mockRejectedValueOnce(new Error('Connection count query failed')); 

			const result = await repository.healthCheck();

			expect(result.status).toBe('healthy');
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.version).toBeUndefined();
			expect(result.connectionCount).toBeUndefined();
		});

		it('should return unhealthy status when database is not accessible', async () => {
			const dbError = new Error('Connection refused');
			mockKnex.raw.mockImplementation((() =>
				new Promise((_, reject) => setTimeout(() => reject(dbError), 10))
		) as any);

			const result = await repository.healthCheck();

			expect(result.status).toBe('unhealthy');
			expect(result.responseTime).toBeGreaterThan(0);
			expect(result.error).toBe('Connection refused');
		});

		it('should handle different database response formats', async () => {
			
			mockKnex.raw
				.mockResolvedValueOnce([{ health_check: 1 }]) 
				.mockResolvedValueOnce([{ version: 'MySQL 8.0' }]) 
				.mockResolvedValueOnce([{ connection_count: '3' }]); 

			const result = await repository.healthCheck();

			expect(result.status).toBe('healthy');
			expect(result.version).toBe('MySQL 8.0');
			expect(result.connectionCount).toBe(3);
		});
	});

	describe('performDetailedHealthCheck', () => {
		it('should return detailed health information with pool info', async () => {
			mockKnex.raw.mockResolvedValue({ rows: [{ health_check: 1 }] });

			const result = await repository.performDetailedHealthCheck();

			expect(result.basic.status).toBe('healthy');
			expect(result.poolInfo).toEqual({
				used: 2,
				free: 8,
				pendingAcquires: 0,
				pendingCreates: 0
			});
		});

		it('should work without pool information', async () => {
			mockKnex.raw.mockResolvedValue({ rows: [{ health_check: 1 }] });
			mockKnex.client.pool = null; 

			const result = await repository.performDetailedHealthCheck();

			expect(result.basic.status).toBe('healthy');
			expect(result.poolInfo).toBeUndefined();
		});

		it('should handle pool information errors gracefully', async () => {
			mockKnex.raw.mockResolvedValue({ rows: [{ health_check: 1 }] });
			
			mockKnex.client.pool.numUsed.mockImplementation(() => {
				throw new Error('Pool error');
			});

			const result = await repository.performDetailedHealthCheck();

			expect(result.basic.status).toBe('healthy');
			expect(result.poolInfo).toBeUndefined();
		});
	});

	describe('error handling', () => {
		it('should handle connection errors', async () => {
			const connectionError = new Error('ECONNREFUSED');
			connectionError.name = 'ConnectionError';
			mockKnex.raw.mockRejectedValue(connectionError);

			const result = await repository.healthCheck();

			expect(result.status).toBe('unhealthy');
			expect(result.error).toBe('ECONNREFUSED');
		});

		it('should handle timeout errors', async () => {
			const timeoutError = new Error('Query timeout');
			timeoutError.name = 'TimeoutError';
			mockKnex.raw.mockRejectedValue(timeoutError);

			const result = await repository.healthCheck();

			expect(result.status).toBe('unhealthy');
			expect(result.error).toBe('Query timeout');
		});
	});
}); 