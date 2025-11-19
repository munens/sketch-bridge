import {Request, Response, NextFunction, RequestHandler} from 'express';
import Joi from 'joi';
import {BadRequestError} from '../../model';

export function validateRequestBody<
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
			await schema.validateAsync(req.body);
		} catch (err) {
			return next(new BadRequestError('invalid request body', err));
		}

		next();
	};
}

export function validateRequestBodyWithValidation<
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
			await schema.validateAsync(req.body);
			await handler(req, res, next);
		} catch (err) {
			next(new BadRequestError('invalid request body', err));
		}
	};
}