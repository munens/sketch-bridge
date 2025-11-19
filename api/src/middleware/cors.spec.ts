import {corsHandler} from './cors';
import cors from 'cors';

// Mock the cors module
jest.mock('cors');
const mockCors = cors as jest.MockedFunction<typeof cors>;

describe('corsHandler', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// Reset environment variables
		delete process.env.CLIENT_URL;
	});

	it('should create cors middleware with correct configuration', () => {
		const mockMiddleware = jest.fn();
		mockCors.mockReturnValue(mockMiddleware);
		
		process.env.CLIENT_URL = 'https://example.com';

		const result = corsHandler();

		expect(mockCors).toHaveBeenCalledWith({
			origin: 'https://example.com',
			methods: ['GET', 'POST', 'PUT', 'DELETE']
		});
		expect(result).toBe(mockMiddleware);
	});

	it('should handle undefined CLIENT_URL', () => {
		const mockMiddleware = jest.fn();
		mockCors.mockReturnValue(mockMiddleware);

		const result = corsHandler();

		expect(mockCors).toHaveBeenCalledWith({
			origin: undefined,
			methods: ['GET', 'POST', 'PUT', 'DELETE']
		});
		expect(result).toBe(mockMiddleware);
	});

	it('should return the cors middleware function', () => {
		const mockMiddleware = jest.fn();
		mockCors.mockReturnValue(mockMiddleware);

		const result = corsHandler();

		expect(typeof result).toBe('function');
		expect(result).toBe(mockMiddleware);
	});
}); 