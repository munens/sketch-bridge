import { BaseService } from '../model/base';
import { SessionRepository } from './repository';
import { Session } from './types';
import { CANVAS_LIMITS } from '../constants';
import { logSocketSuccess, logSocketError } from '../middleware';

export class SessionService extends BaseService {
	private cleanupInterval: NodeJS.Timeout;

	constructor(protected readonly repository: SessionRepository) {
		super(repository);
		this.cleanupStaleSessionsOnStartup();
		this.startCleanupTask();
	}

	private cleanupStaleSessionsOnStartup(): void {
		setTimeout(async () => {
			try {
				const deletedCount = await this.repository.deleteExpiredSessions(0);
				if (deletedCount > 0) {
					logSocketSuccess('Cleaned up stale sessions from previous server run', { count: deletedCount });
				}
			} catch (error) {
				logSocketError(error, { operation: 'cleanupStaleSessionsOnStartup' });
			}
		}, 100);
	}

	async createSession(session: Session): Promise<Session> {
		try {
			const createdSession = await this.repository.createSession(session);
			logSocketSuccess('Session created', { sessionId: createdSession.id });
			return createdSession;
		} catch (error) {
			logSocketError(error, { operation: 'createSession' });
			throw error;
		}
	}

	async getSessionById(sessionId: string): Promise<Session | null> {
		return await this.repository.getSessionById(sessionId);
	}

	async getActiveSessionsByCanvas(canvasId: string): Promise<Session[]> {
		return await this.repository.getSessionsByCanvasId(canvasId);
	}

	async updateCursorPosition(
		sessionId: string,
		x: number,
		y: number
	): Promise<void> {
		await this.repository.updateCursorPosition(sessionId, x, y);
	}

	async updateLastActivity(sessionId: string): Promise<void> {
		await this.repository.updateLastActivity(sessionId);
	}

	async deleteSession(sessionId: string): Promise<void> {
		try {
			await this.repository.deleteSession(sessionId);
			logSocketSuccess('Session deleted', { sessionId });
		} catch (error) {
			logSocketError(error, { operation: 'deleteSession', sessionId });
			throw error;
		}
	}

	async getUserSessionsFromCanvas(userId: string, canvasId: string): Promise<Session[]> {
		return await this.repository.getUserSessionsFromCanvas(userId, canvasId);
	}

	async deleteUserSessionsFromCanvas(userId: string, canvasId: string): Promise<number> {
		try {
			const deletedCount = await this.repository.deleteUserSessionsFromCanvas(userId, canvasId);
			if (deletedCount > 0) {
				logSocketSuccess('User sessions deleted from canvas', { userId, canvasId, count: deletedCount });
			}
			return deletedCount;
		} catch (error) {
			logSocketError(error, { operation: 'deleteUserSessionsFromCanvas', userId, canvasId });
			throw error;
		}
	}

	private startCleanupTask(): void {
		this.cleanupInterval = setInterval(async () => {
			try {
				const deletedCount = await this.repository.deleteExpiredSessions(
					CANVAS_LIMITS.SESSION_TIMEOUT_MS
				);

				if (deletedCount > 0) {
					logSocketSuccess('Cleaned up expired sessions', { count: deletedCount });
				}
			} catch (error) {
				logSocketError(error, { operation: 'cleanupExpiredSessions' });
			}
		}, 60000);
	}

	stopCleanupTask(): void {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
		}
	}
}

