import {Knex} from 'knex';
import {BaseRepository} from '../model/base';
import {InternalServerError} from '../model/errors';

export interface DatabaseHealthStatus {
	status: 'healthy' | 'unhealthy';
	responseTime: number;
	connectionCount?: number;
	version?: string;
	error?: string;
}

export class HealthRepository extends BaseRepository {
	
	constructor(knexClient: Knex) {
		super(knexClient, 'health_checks');
	}

	async healthCheck(): Promise<DatabaseHealthStatus> {
		const startTime = Date.now();

		try {
			
			await this.knexClient.raw('SELECT 1 as health_check');
			
			
			let version: string | undefined;
			try {
				const versionResult = await this.knexClient.raw('SELECT version() as version');
				version = versionResult.rows?.[0]?.version || versionResult[0]?.version;
			} catch (error) {
				
				console.log('Could not retrieve database version', { error: error.message });
			}

			
			let connectionCount: number | undefined;
			try {
				const connResult = await this.knexClient.raw(`
					SELECT count(*) as connection_count 
					FROM pg_stat_activity 
					WHERE state = 'active'
				`);
				connectionCount = parseInt(connResult.rows?.[0]?.connection_count || connResult[0]?.connection_count || '0');
			} catch (error) {
				
				console.log('Could not retrieve connection count', { error: error.message });
			}

			const responseTime = Date.now() - startTime;

			return {
				status: 'healthy',
				responseTime,
				...(version && { version }),
				...(connectionCount !== undefined && { connectionCount })
			};

		} catch (error) {
			const responseTime = Date.now() - startTime;
			
			console.error('Database health check failed', {
				error: error.message,
				responseTime,
				stack: error.stack
			});

			return {
				status: 'unhealthy',
				responseTime,
				error: error.message
			};
		}
	}

	async pingDatabase(): Promise<{ success: boolean; responseTime: number; error?: string }> {
		const startTime = Date.now();

		try {
			await this.knexClient.raw('SELECT 1');
			return {
				success: true,
				responseTime: Date.now() - startTime
			};
		} catch (error) {
			return {
				success: false,
				responseTime: Date.now() - startTime,
				error: error.message
			};
		}
	}

	async performDetailedHealthCheck(): Promise<{
		basic: DatabaseHealthStatus;
		poolInfo?: {
			used: number;
			free: number;
			pendingAcquires: number;
			pendingCreates: number;
		};
	}> {
		const basic = await this.healthCheck();

		
		let poolInfo;
		try {
			const pool = this.knexClient.client.pool;
			if (pool) {
				poolInfo = {
					used: pool.numUsed(),
					free: pool.numFree(),
					pendingAcquires: pool.numPendingAcquires(),
					pendingCreates: pool.numPendingCreates()
				};
			}
		} catch (error) {
			console.log('Could not retrieve pool information', { error: error.message });
		}

		return {
			basic,
			...(poolInfo && { poolInfo })
		};
	}
} 