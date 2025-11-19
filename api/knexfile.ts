import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config = {
	development: {
		client: 'pg',
		connection: {
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			port: Number(process.env.DATABASE_PORT),
			host: process.env.DATABASE_HOST
		},
		pool: {
			min: 0,
			max: 7
		},
		migrations: {
			tableName: 'travel_collaboration_app_knex_migrations_dev',
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
		connection: {
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			port: Number(process.env.DATABASE_PORT),
			host: process.env.DATABASE_HOST
		},
		pool: {
			min: 0,
			max: 7
		},
		migrations: {
			tableName: 'travel_collaboration_app_knex_migrations_staging'
		}
	},

	production: {
		client: 'pg',
		connection: {
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			port: Number(process.env.DATABASE_PORT),
			host: process.env.DATABASE_HOST
		},
		pool: {
			min: 0,
			max: 7
		},
		migrations: {
			tableName: 'travel_collaboration_app_knex_migrations_prod'
		}
	}

};

export default config;
