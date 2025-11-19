import {Request, Response, NextFunction, RequestHandler} from 'express';
import Joi from 'joi';
import {BadRequestError} from '../../model/errors';

export function validateRequestParams<
	P = any,
	ResBody = any,
	ReqBody = any,
	ReqQuery = any,
	Locals extends Record<string, any> = Record<string, any>
>(
	schema: Joi.ObjectSchema
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
	return async function (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction): Promise<void> {
		try {
			await schema.validateAsync(req.params);
		} catch (err) {
			return next(new BadRequestError('invalid request params', err));
		}

		next();
	};
}

export function validateRequestParamsWithValidation<
	P = any,
	ResBody = any,
	ReqBody = any,
	ReqQuery = any,
	Locals extends Record<string, any> = Record<string, any>
>(
	schema: Joi.ObjectSchema,
	handler: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>
): RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals> {
	return async (req: Request<P, ResBody, ReqBody, ReqQuery, Locals>, res: Response<ResBody, Locals>, next: NextFunction): Promise<void> => {
		try {
			await schema.validateAsync(req.params);
			await handler(req, res, next);
		} catch (err) {
			next(new BadRequestError('invalid request params', err));
		}
	};
} 