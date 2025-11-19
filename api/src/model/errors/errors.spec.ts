import {
	HttpError,
	BadRequestError,
	UnauthorizedError,
	ForbiddenError,
	NotFoundError,
	ConflictError,
	InternalServerError
} from './index';
import {HttpStatusMessage} from './http-status-message';

describe('Model Error Classes', () => {

	describe('HttpError', () => {
		it('should create error with custom status code and message', () => {
			const error = new HttpError({
				statusCode: 400,
				statusMessage: HttpStatusMessage.BAD_REQUEST,
				message: 'Custom bad request error'
			});
			
			expect(error.statusCode).toBe(400);
			expect(error.statusMessage).toBe(HttpStatusMessage.BAD_REQUEST);
			expect(error.message).toBe('Custom bad request error');
			expect(error).toBeInstanceOf(Error);
		});

		it('should use default message when none provided', () => {
			const error = new HttpError({
				statusCode: 404,
				statusMessage: HttpStatusMessage.NOT_FOUND
			});
			
			expect(error.message).toBe('Not Found');
		});
	});

	describe('BadRequestError', () => {
		it('should create 400 error with correct properties', () => {
			const error = new BadRequestError('Invalid request data');
			
			expect(error.statusCode).toBe(400);
			expect(error.statusMessage).toBe('Bad Request');
			expect(error.message).toBe('Invalid request data');
			expect(error.name).toBe('BadRequestError');
		});

		it('should use default message when none provided', () => {
			const error = new BadRequestError();
			
			expect(error.message).toBe('bad request');
		});

		it('should handle original error', () => {
			const originalError = new Error('Original error');
			const error = new BadRequestError('Custom message', originalError);
			
			expect(error.message).toBe('Custom message');
			
		});
	});

	describe('UnauthorizedError', () => {
		it('should create 401 error with correct properties', () => {
			const error = new UnauthorizedError('Authentication required');
			
			expect(error.statusCode).toBe(401);
			expect(error.statusMessage).toBe('Unauthorized');
			expect(error.message).toBe('Authentication required');
			expect(error.name).toBe('UnauthorizedError');
		});

		it('should use default message when none provided', () => {
			const error = new UnauthorizedError();
			
			expect(error.message).toBe('unauthorized');
		});
	});

	describe('ForbiddenError', () => {
		it('should create 403 error with correct properties', () => {
			const error = new ForbiddenError('Access denied');
			
			expect(error.statusCode).toBe(403);
			expect(error.statusMessage).toBe('Forbidden');
			expect(error.message).toBe('Access denied');
			expect(error.name).toBe('ForbiddenError');
		});

		it('should use default message when none provided', () => {
			const error = new ForbiddenError();
			
			expect(error.message).toBe('forbidden');
		});
	});

	describe('NotFoundError', () => {
		it('should create 404 error with correct properties', () => {
			const error = new NotFoundError('Resource not found');
			
			expect(error.statusCode).toBe(404);
			expect(error.statusMessage).toBe('Not Found');
			expect(error.message).toBe('Resource not found');
			expect(error.name).toBe('NotFoundError');
		});

		it('should use default message when none provided', () => {
			const error = new NotFoundError();
			
			expect(error.message).toBe('not found');
		});
	});

	describe('ConflictError', () => {
		it('should create 409 error with correct properties', () => {
			const error = new ConflictError('Resource already exists');
			
			expect(error.statusCode).toBe(409);
			expect(error.statusMessage).toBe('Conflict');
			expect(error.message).toBe('Resource already exists');
			expect(error.name).toBe('ConflictError');
		});

		it('should use default message when none provided', () => {
			const error = new ConflictError();
			
			expect(error.message).toBe('conflict');
		});
	});

	describe('InternalServerError', () => {
		it('should create 500 error with correct properties', () => {
			const error = new InternalServerError('Database connection failed');
			
			expect(error.statusCode).toBe(500);
			expect(error.statusMessage).toBe('Internal Server Error');
			expect(error.message).toBe('Database connection failed');
			expect(error.name).toBe('InternalServerError');
		});

		it('should use default message when none provided', () => {
			const error = new InternalServerError();
			
			expect(error.message).toBe('internal server error');
		});

		it('should handle original error and stack trace', () => {
			const originalError = new Error('Original database error');
			originalError.stack = 'Original stack trace';
			
			const error = new InternalServerError('Custom message', originalError, 'Custom stack');
			
			expect(error.message).toBe('Custom message');
			
		});
	});

	describe('Error inheritance', () => {
		it('should maintain proper inheritance chain', () => {
			const badRequest = new BadRequestError('Test');
			const notFound = new NotFoundError('Test');
			const internal = new InternalServerError('Test');
			
			expect(badRequest).toBeInstanceOf(HttpError);
			expect(badRequest).toBeInstanceOf(Error);
			
			expect(notFound).toBeInstanceOf(HttpError);
			expect(notFound).toBeInstanceOf(Error);
			
			expect(internal).toBeInstanceOf(HttpError);
			expect(internal).toBeInstanceOf(Error);
		});

		it('should be catchable as HttpError', () => {
			const errors = [
				new BadRequestError('Bad'),
				new NotFoundError('Not found'),
				new InternalServerError('Internal')
			];
			
			errors.forEach(error => {
				expect(error).toBeInstanceOf(HttpError);
				expect(typeof error.statusCode).toBe('number');
				expect(typeof error.statusMessage).toBe('string');
			});
		});
	});

	describe('Error serialization', () => {
		it('should be serializable to JSON', () => {
			const error = new BadRequestError('Test error');
			
			
			expect(() => JSON.stringify(error)).not.toThrow();
			
			const serialized = JSON.stringify(error);
			const parsed = JSON.parse(serialized);
			
			expect(parsed.message).toBe('Test error');
			expect(parsed.name).toBe('BadRequestError');
		});
	});
}); 