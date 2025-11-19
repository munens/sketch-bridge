import type { Knex } from 'knex';
import { BaseRepository } from '../model/base';
import { Session, SessionRecord } from './types';
import { logSocketError } from '../middleware';

export class SessionRepository extends BaseRepository {
	private readonly tableName = 'active_sessions';

	constructor(knexClient: Knex) {
		super(knexClient, 'active_sessions');
	}

	async createSession(session: Session): Promise<Session> {
		try {
			const [record] = await this.knexClient<SessionRecord>(this.tableName)
				.insert({
					id: session.id,
					user_id: session.userId,
					user_name: session.userName,
					canvas_id: session.canvasId,
					cursor_x: session.cursorX,
					cursor_y: session.cursorY,
					color: session.color,
					connected_at: new Date(session.connectedAt),
					last_activity: new Date(session.lastActivity || session.connectedAt)
				})
				.returning('*');

			return this.mapRecordToSession(record);
		} catch (error) {
			logSocketError(error, { operation: 'createSession', sessionId: session.id });
			throw error;
		}
	}

	async getSessionById(sessionId: string): Promise<Session | null> {
		try {
			const record = await this.knexClient<SessionRecord>(this.tableName)
				.where({ id: sessionId })
				.first();

			return record ? this.mapRecordToSession(record) : null;
		} catch (error) {
			logSocketError(error, { operation: 'getSessionById', sessionId });
			throw error;
		}
	}

	async getSessionsByCanvasId(canvasId: string): Promise<Session[]> {
		try {
			const records = await this.knexClient<SessionRecord>(this.tableName)
				.where({ canvas_id: canvasId });

			return records.map(record => this.mapRecordToSession(record));
		} catch (error) {
			logSocketError(error, { operation: 'getSessionsByCanvasId', canvasId });
			throw error;
		}
	}

	async updateCursorPosition(
		sessionId: string,
		x: number,
		y: number
	): Promise<void> {
		try {
			await this.knexClient<SessionRecord>(this.tableName)
				.where({ id: sessionId })
				.update({
					cursor_x: x,
					cursor_y: y,
					last_activity: new Date()
				});
		} catch (error) {
			logSocketError(error, { operation: 'updateCursorPosition', sessionId });
			throw error;
		}
	}

	async updateLastActivity(sessionId: string): Promise<void> {
		try {
			await this.knexClient<SessionRecord>(this.tableName)
				.where({ id: sessionId })
				.update({
					last_activity: new Date()
				});
		} catch (error) {
			logSocketError(error, { operation: 'updateLastActivity', sessionId });
			throw error;
		}
	}

	async deleteSession(sessionId: string): Promise<void> {
		try {
			await this.knexClient<SessionRecord>(this.tableName)
				.where({ id: sessionId })
				.delete();
		} catch (error) {
			logSocketError(error, { operation: 'deleteSession', sessionId });
			throw error;
		}
	}

	async deleteExpiredSessions(expirationTimeMs: number): Promise<number> {
		try {
			if (expirationTimeMs === 0) {
				const deletedCount = await this.knexClient<SessionRecord>(this.tableName)
					.delete();
				return deletedCount;
			}

			const expirationDate = new Date(Date.now() - expirationTimeMs);

			const deletedCount = await this.knexClient<SessionRecord>(this.tableName)
				.where('last_activity', '<', expirationDate)
				.delete();

			return deletedCount;
		} catch (error) {
			logSocketError(error, { operation: 'deleteExpiredSessions' });
			throw error;
		}
	}

	private mapRecordToSession(record: SessionRecord): Session {
		return {
			id: record.id,
			userId: record.user_id,
			userName: record.user_name,
			canvasId: record.canvas_id,
			cursorX: record.cursor_x,
			cursorY: record.cursor_y,
			color: record.color,
			connectedAt: new Date(record.connected_at).getTime(),
			lastActivity: new Date(record.last_activity).getTime()
		};
	}
}

