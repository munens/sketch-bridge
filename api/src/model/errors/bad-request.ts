import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class BadRequestError extends HttpError {
	constructor(
		readonly message: string = 'bad request',
		readonly cause?: ErrorCause,
		readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.BAD_REQUEST,
			statusMessage: HttpStatusMessage.BAD_REQUEST,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'BadRequestError';
	}
}
