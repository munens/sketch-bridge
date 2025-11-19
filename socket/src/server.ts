process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
	console.error('Stack:', error.stack);
	process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise);
	console.error('Reason:', reason);
	process.exit(1);
});

import { config } from 'dotenv';
import { SocketApplication } from './app';
import { DatabaseConfig } from './database-config';

config();

try {
	const {
		PORT,
		DATABASE_URL,
		DATABASE_NAME,
		DATABASE_USER,
		DATABASE_PASSWORD,
		DATABASE_HOST,
		DATABASE_PORT,
		DATABASE_SSL,
		CORS_ORIGIN
	} = process.env;

	// Support both DATABASE_URL (Railway) and individual credentials (local)
	const databaseConfig: DatabaseConfig = DATABASE_URL
		? {
			connectionString: DATABASE_URL,
			ssl: DATABASE_SSL === 'true'
	  }
		: {
			database: DATABASE_NAME,
			user: DATABASE_USER,
			password: DATABASE_PASSWORD,
			host: DATABASE_HOST,
			port: Number(DATABASE_PORT),
			ssl: DATABASE_SSL === 'true'
	  };

	const app = new SocketApplication(
		PORT || '3001',
		databaseConfig,
		CORS_ORIGIN || 'http://localhost:5173'
	);

	app.init();
} catch (error) {
	console.error('Failed to start server:', error);
	if (error instanceof Error) {
		console.error('Error message:', error.message);
		console.error('Error stack:', error.stack);
	}
	process.exit(1);
}

process.on('SIGTERM', () => {
	console.log('SIGTERM signal received: closing HTTP server');
	process.exit(0);
});

process.on('SIGINT', () => {
	console.log('SIGINT signal received: closing HTTP server');
	process.exit(0);
});

