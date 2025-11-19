import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class ForbiddenError extends HttpError {
	constructor(
		readonly message: string = 'forbidden',
		readonly cause?: ErrorCause,
		readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.FORBIDDEN,
			statusMessage: HttpStatusMessage.FORBIDDEN,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'ForbiddenError';
	}
}
