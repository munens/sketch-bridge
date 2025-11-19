import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class NotFoundError extends HttpError {
	constructor(
		readonly message: string = 'not found',
		readonly cause?: ErrorCause,
		readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.NOT_FOUND,
			statusMessage: HttpStatusMessage.NOT_FOUND,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'NotFoundError';
	}
}
