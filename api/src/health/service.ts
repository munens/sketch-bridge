import {BaseService, InternalServerError} from '../model';
import {HealthRepository} from './repository';
import {logControllerError, logControllerSuccess, logger} from '../middleware';

export interface HealthCheckResult {
	status: 'healthy' | 'unhealthy' | 'degraded';
	timestamp: string;
	uptime: number;
	version: string;
	environment: string;
	checks: {
		memory?: MemoryHealthCheck;
		disk?: DiskHealthCheck;
		database?: DatabaseHealthCheck;
	};
	responseTime: number;
}

export interface MemoryHealthCheck {
	status: 'healthy' | 'degraded';
	used: number;
	total: number;
	percentage: number;
	threshold: number;
}

export interface DiskHealthCheck {
	status: 'healthy' | 'degraded';
	used: number;
	total: number;
	percentage: number;
	threshold: number;
}

export interface DatabaseHealthCheck {
	status: 'healthy' | 'unhealthy';
	responseTime: number;
	error?: string;
}

export class HealthService extends BaseService {
	private readonly memoryThreshold = 85;
	private readonly diskThreshold = 90;

	constructor(protected readonly repository?: HealthRepository) {
		super(repository);
	}

	async performHealthCheck(): Promise<HealthCheckResult> {
		const startTime = Date.now();
		
		try {
			logger.info('Starting comprehensive health check');

			const [memoryCheck, databaseCheck] = await Promise.allSettled([
				this.checkMemory(),
				this.checkDatabase()
			]);

			const result: HealthCheckResult = {
				status: this.determineOverallStatus([
					memoryCheck,
					databaseCheck
				]),
				timestamp: new Date().toISOString(),
				uptime: process.uptime(),
				version: process.env.npm_package_version || '1.0.0',
				environment: process.env.NODE_ENV || 'development',
				checks: {
					...(memoryCheck.status === 'fulfilled' && { memory: memoryCheck.value }),
					...(databaseCheck.status === 'fulfilled' && { database: databaseCheck.value })
				},
				responseTime: Date.now() - startTime
			};

			logger.info('Health check completed', {
				status: result.status,
				responseTime: result.responseTime,
				uptime: result.uptime
			});

			return result;

		} catch (error) {
			logger.error('Health check failed', {
				error: error.message,
				stack: error.stack,
				duration: Date.now() - startTime
			});

			throw new InternalServerError('Health check failed', error);
		}
	}

	async getSimpleStatus(): Promise<{ status: string; timestamp: string }> {
		try {
			const healthCheck = await this.performHealthCheck();
			return {
				status: healthCheck.status,
				timestamp: healthCheck.timestamp
			};
		} catch (error) {
			return {
				status: 'unhealthy',
				timestamp: new Date().toISOString()
			};
		}
	}

	private async checkMemory(): Promise<MemoryHealthCheck> {
		try {
			const memUsage = process.memoryUsage();
			const totalMemory = memUsage.heapTotal;
			const usedMemory = memUsage.heapUsed;
			const percentage = (usedMemory / totalMemory) * 100;

			return {
				status: percentage > this.memoryThreshold ? 'degraded' : 'healthy',
				used: usedMemory,
				total: totalMemory,
				percentage: Math.round(percentage * 100) / 100,
				threshold: this.memoryThreshold
			};

		} catch (error) {
			logger.error('Memory health check failed', { error: error.message });
			throw error;
		}
	}

	private async checkDatabase(): Promise<DatabaseHealthCheck> {
		if (!this.repository) {
			return {
				status: 'healthy',
				responseTime: 0
			};
		}

		const startTime = Date.now();

		try {
			const pingResult = await this.repository.pingDatabase();

			if (pingResult.success) {
				return {
					status: 'healthy',
					responseTime: pingResult.responseTime
				};
			} else {
				return {
					status: 'unhealthy',
					responseTime: pingResult.responseTime,
					error: pingResult.error
				};
			}

		} catch (error) {
			const responseTime = Date.now() - startTime;
			
			logger.error('Database health check failed', {
				error: error.message,
				responseTime
			});

			return {
				status: 'unhealthy',
				responseTime,
				error: error.message
			};
		}
	}

	private determineOverallStatus(checks: PromiseSettledResult<any>[]): 'healthy' | 'unhealthy' | 'degraded' {
		let hasUnhealthy = false;
		let hasDegraded = false;

		for (const check of checks) {
			if (check.status === 'fulfilled') {
				if (check.value.status === 'unhealthy') {
					hasUnhealthy = true;
				} else if (check.value.status === 'degraded') {
					hasDegraded = true;
				}
			} else {
				
				hasUnhealthy = true;
			}
		}

		if (hasUnhealthy) return 'unhealthy';
		if (hasDegraded) return 'degraded';
		return 'healthy';
	}
}