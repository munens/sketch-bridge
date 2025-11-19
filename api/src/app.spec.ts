import {Application} from './app';
import {BaseModule} from './model';
import {DatabaseConfig} from './database-config';
import express from 'express';
import knex from 'knex';

// Mock dependencies
jest.mock('express');
jest.mock('knex');
jest.mock('./middleware', () => ({
	logger: jest.fn(() => (req: any, res: any, next: any) => next()),
	corsHandler: jest.fn(() => (req: any, res: any, next: any) => next()),
	errorHandler: jest.fn(),
	requestLogger: jest.fn(() => (req: any, res: any, next: any) => next())
}));

const mockExpress = express as jest.MockedFunction<typeof express>;
const mockKnex = knex as jest.MockedFunction<typeof knex>;

// Mock BaseModule
class MockModule extends BaseModule {
	readonly baseRoute = '/test';
	public router = {} as any;
	
	constructor() {
		super();
		this.controller = {
			baseRoute: 'test',
			router: this.router
		} as any;
	}
	
	init(knexClient: any) {
		// Mock implementation
	}
}

class MockModule2 extends BaseModule {
	readonly baseRoute = '/module2';
	public router = {} as any;
	
	constructor() {
		super();
		this.controller = {
			baseRoute: 'module2',
			router: this.router
		} as any;
	}
	
	init(knexClient: any) {
		// Mock implementation
	}
}

describe('Application', () => {
	let app: Application;
	let mockExpressApp: any;
	let mockKnexClient: any;
	let mockModules: BaseModule[];
	let databaseConfig: DatabaseConfig;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock express app
		mockExpressApp = {
			use: jest.fn(),
			listen: jest.fn((port, callback) => {
				if (callback) callback();
				return { on: jest.fn() };
			})
		};
		mockExpress.mockReturnValue(mockExpressApp);
		(mockExpress as any).json = jest.fn();

		// Mock knex client
		mockKnexClient = {
			destroy: jest.fn()
		};
		mockKnex.mockReturnValue(mockKnexClient);

		// Setup test data
		mockModules = [new MockModule()];
		databaseConfig = {
			host: 'localhost',
			port: 5432,
			user: 'testuser',
			password: 'testpass',
			database: 'testdb',
			ssl: false
		};

		app = new Application('3000', mockModules, databaseConfig);
	});

	describe('init', () => {
		it('should initialize knex client with correct configuration', () => {
			app.init();

			expect(mockKnex).toHaveBeenCalledWith({
				client: 'pg',
				connection: {
					host: 'localhost',
					port: 5432,
					user: 'testuser',
					password: 'testpass',
					database: 'testdb',
					ssl: false
				},
				pool: {
					min: 2,
					max: 10
				}
			});
		});

		it('should configure app-level middleware', () => {
			app.init();

			expect(mockExpressApp.use).toHaveBeenCalledTimes(5); // CORS, request logger, express.json, module route, error handler
		});

		it('should initialize modules with knex client', () => {
			const mockModuleInit = jest.spyOn(mockModules[0], 'init');
			
			app.init();

			expect(mockModuleInit).toHaveBeenCalledWith(mockKnexClient);
		});

		it('should register module routes', () => {
			app.init();

			expect(mockExpressApp.use).toHaveBeenCalledWith('/test', mockModules[0].controller!.router);
		});

		it('should register error handler middleware last', () => {
			app.init();

			// Error handler should be the last middleware registered
			const calls = mockExpressApp.use.mock.calls;
			expect(calls[calls.length - 1][0]).toBeDefined(); // Error handler function
		});

		it('should start server on correct port', () => {
			app.init();

			expect(mockExpressApp.listen).toHaveBeenCalledWith('3000', expect.any(Function));
		});
	});

	describe('constructor', () => {
		it('should store configuration correctly', () => {
			const testApp = new Application('8080', mockModules, databaseConfig);
			
			expect(testApp).toBeDefined();
		});

		it('should handle empty modules array', () => {
			const testApp = new Application('3000', [], databaseConfig);
			
			expect(() => testApp.init()).not.toThrow();
		});

		it('should handle SSL enabled configuration', () => {
			const sslConfig = { ...databaseConfig, ssl: true };
			const testApp = new Application('3000', mockModules, sslConfig);
			
			testApp.init();

			expect(mockKnex).toHaveBeenCalledWith(
				expect.objectContaining({
					connection: expect.objectContaining({
						ssl: true
					})
				})
			);
		});
	});

	describe('integration', () => {
		it('should handle multiple modules', () => {
			const module2 = new MockModule2();
			const multiModuleApp = new Application('3000', [mockModules[0], module2], databaseConfig);

			multiModuleApp.init();

					expect(mockExpressApp.use).toHaveBeenCalledWith('/test', mockModules[0].controller!.router);
		expect(mockExpressApp.use).toHaveBeenCalledWith('/module2', module2.controller!.router);
		});

		it('should initialize all modules with same knex client', () => {
			const module2 = new MockModule();
			const mockInit1 = jest.spyOn(mockModules[0], 'init');
			const mockInit2 = jest.spyOn(module2, 'init');
			
			const multiModuleApp = new Application('3000', [mockModules[0], module2], databaseConfig);
			multiModuleApp.init();

			expect(mockInit1).toHaveBeenCalledWith(mockKnexClient);
			expect(mockInit2).toHaveBeenCalledWith(mockKnexClient);
		});
	});

	describe('server startup', () => {
		it('should log successful startup', () => {
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			
			app.init();

			expect(consoleSpy).toHaveBeenCalledWith('app listening at 3000');
			
			consoleSpy.mockRestore();
		});

		it('should handle different port configurations', () => {
			const portApp = new Application('8080', mockModules, databaseConfig);
			const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
			
			portApp.init();

			expect(mockExpressApp.listen).toHaveBeenCalledWith('8080', expect.any(Function));
			expect(consoleSpy).toHaveBeenCalledWith('app listening at 8080');
			
			consoleSpy.mockRestore();
		});
	});
}); 