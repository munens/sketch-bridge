import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class InternalServerError extends HttpError {
	constructor(
		readonly message: string = 'internal server error',
		readonly cause?: ErrorCause,
		readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
			statusMessage: HttpStatusMessage.INTERNAL_SERVER_ERROR,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'InternalServerError';
	}
}
