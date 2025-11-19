import Joi from 'joi';
import {validateRequestParams, validateRequestParamsWithValidation} from './validate-request-params';
import {Request, Response} from 'express';
import {BadRequestError} from '../../model/errors';

describe('validateRequestParams', () => {

	let schema: Joi.ObjectSchema;
	beforeEach(() => {
		schema = Joi.object({
			gameTypeId: Joi.string().required(),
			categoryId: Joi.string().required(),
			gameId: Joi.string().optional()
		});
	});

	describe('when the request params do not meet the schemas requirements', () => {
		it('should call the next function with an errors for missing required param', async () => {
			const requestHandler = validateRequestParams(schema);
			const nextFn = jest.fn();

			const request = {
				params: {
					gameTypeId: '1'
				}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith(expect.any(BadRequestError));
		});

		it('should call the next function with an errors for invalid param type', async () => {
			const numericSchema = Joi.object({
				id: Joi.number().required()
			});

			const requestHandler = validateRequestParams(numericSchema);
			const nextFn = jest.fn();

			const request = {
				params: {
					id: 'not-a-number'
				}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith(expect.any(BadRequestError));
		});
	});

	describe('when the request params meet the schemas requirements', () => {
		it('should call the next function with undefined', async () => {
			const requestHandler = validateRequestParams(schema);
			const nextFn = jest.fn();

			const request = {
				params: {
					gameTypeId: '1',
					categoryId: '2',
					gameId: '3'
				}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith();
		});

		it('should work with optional params', async () => {
			const requestHandler = validateRequestParams(schema);
			const nextFn = jest.fn();

			const request = {
				params: {
					gameTypeId: '1',
					categoryId: '2'
				}
			} as unknown as Request;

			await requestHandler(request, {} as Response, nextFn);

			expect(nextFn).toHaveBeenCalledWith();
		});
	});
});

describe('validateRequestParamsWithValidation', () => {

	let schema: Joi.ObjectSchema;
	beforeEach(() => {
		schema = Joi.object({
			gameTypeId: Joi.string().required(),
			categoryId: Joi.string().required()
		});
	});

	describe('when the request params are valid', () => {
		it('should call the handler after validation passes', async () => {
			const mockHandler = jest.fn();
			const wrappedHandler = validateRequestParamsWithValidation(schema, mockHandler);
			const nextFn = jest.fn();

			const request = {
				params: {
					gameTypeId: '1',
					categoryId: '2'
				}
			} as unknown as Request;

			await wrappedHandler(request, {} as Response, nextFn);

			expect(mockHandler).toHaveBeenCalledWith(request, {}, nextFn);
			expect(nextFn).not.toHaveBeenCalled();
		});
	});

	describe('when the request params are invalid', () => {
		it('should call next with errors without calling the handler', async () => {
			const mockHandler = jest.fn();
			const wrappedHandler = validateRequestParamsWithValidation(schema, mockHandler);
			const nextFn = jest.fn();

			const request = {
				params: {
					gameTypeId: '1'
				}
			} as unknown as Request;

			await wrappedHandler(request, {} as Response, nextFn);

			expect(mockHandler).not.toHaveBeenCalled();
			expect(nextFn).toHaveBeenCalledWith(expect.any(BadRequestError));
		});
	});
}); 