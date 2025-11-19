import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class UnauthorizedError extends HttpError {
	constructor(
		readonly message: string = 'unauthorized',
		readonly cause?: ErrorCause,
		readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.UNAUTHORIZED,
			statusMessage: HttpStatusMessage.UNAUTHORIZED,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'UnauthorizedError';
	}
}
