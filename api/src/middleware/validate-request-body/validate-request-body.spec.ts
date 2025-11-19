import Joi from 'joi';
import {validateRequestBody, validateRequestBodyWithValidation} from './validate-request-body';
import {Request, Response} from 'express';
import {BadRequestError} from '../../model/errors';

describe('validateRequestBody', () => {

	let schema: Joi.ObjectSchema;
	beforeEach(() => {
		schema = Joi.object({
			score: Joi.number().valid(0, 1).required()
		});
	});

	describe('when the request body does not meet the schemas requirements', () => {
		it('should call the next function with an errors', async () => {
			const requestHandler = validateRequestBody(schema);
			const nextFn = jest.fn();

			const request = {
				body: {}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith(expect.any(BadRequestError));
		});
	});

	describe('when the request body does meet the schemas requirements', () => {
		it('should call the next function with undefined', async () => {
			const requestHandler = validateRequestBody(schema);
			const nextFn = jest.fn();

			const request = {
				body: {
					score: 1
				}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith();
		});
	});
});

describe('validateRequestBodyWithValidation', () => {

	let schema: Joi.ObjectSchema;
	beforeEach(() => {
		schema = Joi.object({
			score: Joi.number().valid(0, 1).required()
		});
	});

	describe('when the request body is valid', () => {
		it('should call the handler after validation passes', async () => {
			const mockHandler = jest.fn();
			const wrappedHandler = validateRequestBodyWithValidation(schema, mockHandler);
			const nextFn = jest.fn();

			const request = {
				body: { score: 1 }
			} as unknown as Request;

			await wrappedHandler(request, {} as Response, nextFn);

			expect(mockHandler).toHaveBeenCalledWith(request, {}, nextFn);
			expect(nextFn).not.toHaveBeenCalled();
		});
	});

	describe('when the request body is invalid', () => {
		it('should call next with errors without calling the handler', async () => {
			const mockHandler = jest.fn();
			const wrappedHandler = validateRequestBodyWithValidation(schema, mockHandler);
			const nextFn = jest.fn();

			const request = {
				body: {}
			} as unknown as Request;

			await wrappedHandler(request, {} as Response, nextFn);

			expect(mockHandler).not.toHaveBeenCalled();
			expect(nextFn).toHaveBeenCalledWith(expect.any(BadRequestError));
		});
	});
}); 