import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

// Helper function to get database connection config
// Supports both individual credentials and DATABASE_URL
const getDatabaseConnection = () => {
	// If DATABASE_URL is provided (Railway default), use it
	if (process.env.DATABASE_URL) {
		return {
			connectionString: process.env.DATABASE_URL,
			ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
		};
	}
	
	// Otherwise use individual credentials
	return {
		database: process.env.DATABASE_NAME,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASSWORD,
		port: Number(process.env.DATABASE_PORT),
		host: process.env.DATABASE_HOST,
		ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
	};
};

const config = {
	development: {
		client: 'pg',
		connection: getDatabaseConnection(),
		pool: {
			min: 0,
			max: 7
		},
		migrations: {
			tableName: 'sketch_bridge_socket_knex_migrations_dev',
			directory: 'db/migrations',
			extension: 'ts'
		},
		seeds: {
			directory: 'db/seeds',
			extension: 'ts'
		}
	},

	staging: {
		client: 'pg',
		connection: getDatabaseConnection(),
		pool: {
			min: 0,
			max: 7
		},
		migrations: {
			tableName: 'sketch_bridge_socket_knex_migrations_staging',
			directory: 'db/migrations',
			extension: 'ts'
		}
	},

	production: {
		client: 'pg',
		connection: getDatabaseConnection(),
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'sketch_bridge_socket_knex_migrations_prod',
			directory: 'db/migrations',
			extension: 'ts'
		}
	}

};

export default config;

