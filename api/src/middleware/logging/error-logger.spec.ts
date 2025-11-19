import {logControllerError, logControllerSuccess, logServiceCall, logDatabaseQuery} from './error-logger';
import {logger} from './logger';

// Mock the logger
jest.mock('./logger', () => ({
	logger: {
		error: jest.fn(),
		info: jest.fn(),
		debug: jest.fn()
	}
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('error-logger utilities', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('logControllerError', () => {
		it('should log controller error with full context', () => {
			const error = new Error('Test error');
			(error as any).statusCode = 400;
			const context = {
				requestId: 'req-123',
				operation: 'createUser',
				params: { userId: '456' },
				body: { name: 'John' },
				query: { include: 'profile' },
				duration: 150
			};

			logControllerError(error, context);

			expect(mockLogger.error).toHaveBeenCalledWith('Controller error', {
				requestId: 'req-123',
				operation: 'createUser',
				error: {
					name: 'Error',
					message: 'Test error',
					stack: expect.any(String),
					statusCode: 400
				},
				request: {
					params: { userId: '456' },
					body: { name: 'John' },
					query: { include: 'profile' }
				},
				duration: 150,
				timestamp: expect.any(String)
			});
		});

		it('should handle error without statusCode', () => {
			const error = new Error('Generic error');
			const context = {
				requestId: 'req-456',
				operation: 'updateUser',
				duration: 200
			};

			logControllerError(error, context);

			expect(mockLogger.error).toHaveBeenCalledWith('Controller error', expect.objectContaining({
				error: expect.objectContaining({
					name: 'Error',
					message: 'Generic error',
					statusCode: undefined
				})
			}));
		});

		it('should handle minimal context', () => {
			const error = new Error('Minimal error');
			const context = {
				requestId: 'req-789',
				operation: 'deleteUser',
				duration: 50
			};

			logControllerError(error, context);

			expect(mockLogger.error).toHaveBeenCalledWith('Controller error', expect.objectContaining({
				requestId: 'req-789',
				operation: 'deleteUser',
				request: {
					params: undefined,
					body: undefined,
					query: undefined
				}
			}));
		});
	});

	describe('logControllerSuccess', () => {
		it('should log controller success with data count', () => {
			const context = {
				requestId: 'req-success-1',
				operation: 'getUsers',
				duration: 100,
				data: [{ id: 1 }, { id: 2 }, { id: 3 }]
			};

			logControllerSuccess('Users retrieved successfully', context);

			expect(mockLogger.info).toHaveBeenCalledWith('Controller success', {
				message: 'Users retrieved successfully',
				requestId: 'req-success-1',
				operation: 'getUsers',
				duration: 100,
				resultCount: 3,
				timestamp: expect.any(String)
			});
		});

		it('should log controller success with explicit result count', () => {
			const context = {
				requestId: 'req-success-2',
				operation: 'searchUsers',
				duration: 75,
				resultCount: 42
			};

			logControllerSuccess('Search completed', context);

			expect(mockLogger.info).toHaveBeenCalledWith('Controller success', expect.objectContaining({
				resultCount: 42
			}));
		});

		it('should handle success without data', () => {
			const context = {
				requestId: 'req-success-3',
				operation: 'updateProfile',
				duration: 120
			};

			logControllerSuccess('Profile updated', context);

			expect(mockLogger.info).toHaveBeenCalledWith('Controller success', expect.objectContaining({
				resultCount: undefined
			}));
		});

		it('should handle non-array data', () => {
			const context = {
				requestId: 'req-success-4',
				operation: 'getUser',
				duration: 80,
				data: { id: 1, name: 'John' }
			};

			logControllerSuccess('User retrieved', context);

			expect(mockLogger.info).toHaveBeenCalledWith('Controller success', expect.objectContaining({
				resultCount: undefined
			}));
		});
	});

	describe('logServiceCall', () => {
		it('should log service call with parameters', () => {
			const context = {
				requestId: 'req-service-1',
				params: { userId: 123, includeProfile: true }
			};

			logServiceCall('UserService', 'findById', context);

			expect(mockLogger.debug).toHaveBeenCalledWith('Service call', {
				service: 'UserService',
				method: 'findById',
				requestId: 'req-service-1',
				params: { userId: 123, includeProfile: true },
				timestamp: expect.any(String)
			});
		});

		it('should log service call without parameters', () => {
			const context = {
				requestId: 'req-service-2'
			};

			logServiceCall('EmailService', 'sendWelcomeEmail', context);

			expect(mockLogger.debug).toHaveBeenCalledWith('Service call', expect.objectContaining({
				service: 'EmailService',
				method: 'sendWelcomeEmail',
				params: undefined
			}));
		});
	});

	describe('logDatabaseQuery', () => {
		it('should log database query with full context', () => {
			const context = {
				requestId: 'req-db-1',
				duration: 45,
				table: 'users'
			};

			logDatabaseQuery('SELECT * FROM users WHERE active = ?', context);

			expect(mockLogger.debug).toHaveBeenCalledWith('Database query', {
				query: 'SELECT * FROM users WHERE active = ?',
				table: 'users',
				duration: 45,
				requestId: 'req-db-1',
				timestamp: expect.any(String)
			});
		});

		it('should normalize whitespace in query', () => {
			const context = {
				requestId: 'req-db-2',
				duration: 30
			};

			const messyQuery = `SELECT   *
			FROM    users
			WHERE   id = ?   AND
					active = true`;

			logDatabaseQuery(messyQuery, context);

			expect(mockLogger.debug).toHaveBeenCalledWith('Database query', expect.objectContaining({
				query: 'SELECT * FROM users WHERE id = ? AND active = true'
			}));
		});

		it('should handle minimal context', () => {
			logDatabaseQuery('INSERT INTO logs (message) VALUES (?)', {});

			expect(mockLogger.debug).toHaveBeenCalledWith('Database query', {
				query: 'INSERT INTO logs (message) VALUES (?)',
				table: undefined,
				duration: undefined,
				requestId: undefined,
				timestamp: expect.any(String)
			});
		});

		it('should handle complex query formatting', () => {
			const complexQuery = `
				UPDATE users 
				SET last_login = NOW(),
					login_count = login_count + 1
				WHERE id = ? 
				AND active = true
			`;

			logDatabaseQuery(complexQuery, { requestId: 'req-db-3' });

			expect(mockLogger.debug).toHaveBeenCalledWith('Database query', expect.objectContaining({
				query: 'UPDATE users SET last_login = NOW(), login_count = login_count + 1 WHERE id = ? AND active = true'
			}));
		});
	});
}); 