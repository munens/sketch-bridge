export class SocketError extends Error {
	constructor(
		message: string,
		public readonly code: string,
		public readonly details?: any
	) {
		super(message);
		this.name = 'SocketError';
	}
}

export class CanvasNotFoundError extends SocketError {
	constructor(canvasId: string) {
		super(`Canvas not found: ${canvasId}`, 'CANVAS_NOT_FOUND', { canvasId });
		this.name = 'CanvasNotFoundError';
	}
}

export class SessionExpiredError extends SocketError {
	constructor(sessionId: string) {
		super(`Session expired: ${sessionId}`, 'SESSION_EXPIRED', { sessionId });
		this.name = 'SessionExpiredError';
	}
}

export class CanvasLimitExceededError extends SocketError {
	constructor(limit: number) {
		super(`Canvas object limit exceeded: ${limit}`, 'CANVAS_LIMIT_EXCEEDED', { limit });
		this.name = 'CanvasLimitExceededError';
	}
}

