import knex, { Knex } from 'knex';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.test' });

export default async function globalTeardown() {
	console.log('🧹 Cleaning up integration test environment...');

	let knexClient: Knex | null = null;

	try {
		const testDbName = process.env.TEST_DB_NAME || 'cheza_test';

    
		knexClient = knex({
			client: 'pg',
			connection: {
				host: process.env.TEST_DB_HOST || 'localhost',
				port: parseInt(process.env.TEST_DB_PORT || '5432'),
				user: process.env.TEST_DB_USER || 'postgres',
				password: process.env.TEST_DB_PASSWORD || 'password',
        
			},
		});

    
		const keepTestDb = process.env.KEEP_TEST_DB === 'true';

		if (keepTestDb) {
			console.log(`🔍 Keeping test database for debugging: ${testDbName}`);
		} else {
      
			console.log(`🗑️  Dropping test database: ${testDbName}`);
      
      
			await knexClient.raw(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = ? AND pid <> pg_backend_pid()
      `, [testDbName]);

      
			await knexClient.raw('DROP DATABASE IF EXISTS ??', [testDbName]);
			console.log('✅ Test database cleanup completed');
		}

	} catch (error) {
		console.error('❌ Error cleaning up test database:', error);
    
	} finally {
		if (knexClient) {
			await knexClient.destroy();
		}
	}
} 