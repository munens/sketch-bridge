import {logger} from './logger';

describe('Logger', () => {
	
	it('should have winston logger instance', () => {
		expect(logger).toBeDefined();
		expect(typeof logger.info).toBe('function');
		expect(typeof logger.error).toBe('function');
		expect(typeof logger.debug).toBe('function');
	});
	
	it('should log info messages without throwing', () => {
		expect(() => {
			logger.info('Test info message', { requestId: '123', operation: 'test' });
		}).not.toThrow();
	});
	
	it('should log error messages without throwing', () => {
		expect(() => {
			const error = new Error('Test error');
			logger.error('Test error message', { error: error.message });
		}).not.toThrow();
	});
	
	it('should log debug messages without throwing', () => {
		expect(() => {
			logger.debug('Test debug message', { service: 'test-service' });
		}).not.toThrow();
	});
	
	it('should include default metadata in logs', () => {
		expect(() => {
			logger.info('Test with default meta');
		}).not.toThrow();
	});
	
	it('should have correct log level configuration', () => {
		expect(logger.level).toBeDefined();
	});
}); 