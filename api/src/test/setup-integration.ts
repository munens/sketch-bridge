import dotenv from 'dotenv';


dotenv.config({ path: '.env.test' });


process.env.NODE_ENV = 'test';


const requiredEnvVars = [
	'TEST_DB_HOST',
	'TEST_DB_PORT',
	'TEST_DB_USER',
	'TEST_DB_PASSWORD',
	'TEST_DB_NAME',
	'JWT_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
	console.warn(`Warning: Missing test environment variables: ${missingEnvVars.join(', ')}`);
	console.warn('Using default values for integration tests');
  
  
	if (!process.env.TEST_DB_HOST) process.env.TEST_DB_HOST = 'localhost';
	if (!process.env.TEST_DB_PORT) process.env.TEST_DB_PORT = '5432';
	if (!process.env.TEST_DB_USER) process.env.TEST_DB_USER = 'postgres';
	if (!process.env.TEST_DB_PASSWORD) process.env.TEST_DB_PASSWORD = 'password';
	if (!process.env.TEST_DB_NAME) process.env.TEST_DB_NAME = 'cheza_test';
	if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret-key';
}


jest.setTimeout(30000);


beforeAll(async () => {
	console.log('🚀 Starting integration tests...');
});

afterAll(async () => {
	console.log('✅ Integration tests completed');
});


process.on('unhandledRejection', (reason, promise) => {
	console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});


process.on('uncaughtException', (error) => {
	console.error('Uncaught Exception:', error);
}); 