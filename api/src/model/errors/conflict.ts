import {ErrorCause} from './error-cause';
import {HttpError} from './http-error';
import {HttpStatusCode} from './http-status-code';
import {HttpStatusMessage} from './http-status-message';

export class ConflictError extends HttpError {
	constructor(
    readonly message: string = 'conflict',
    readonly cause?: ErrorCause,
    readonly stack?: string
	) {
		super({
			statusCode: HttpStatusCode.CONFLICT,
			statusMessage: HttpStatusMessage.CONFLICT,
			message,
			...cause && {cause},
			...stack && {stack}
		});
		
		this.name = 'ConflictError';
	}
}
