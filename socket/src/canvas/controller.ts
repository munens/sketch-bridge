import { Server, Socket } from 'socket.io';
import { BaseController } from '../model/base';
import { CanvasService } from './service';
import { SessionService } from '../session/service';
import { SOCKET_EVENTS } from '../constants';
import { logSocketEvent, logSocketError } from '../middleware';
import { CanvasObject } from './types';

export class CanvasController extends BaseController {
	readonly namespace = '/canvas';
	private io: Server;

	constructor(
		protected readonly service: CanvasService,
		private readonly sessionService: SessionService
	) {
		super();
	}

	init(io: Server): void {
		this.io = io;
		
		this.io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
			this.handleConnection(socket);
		});

		logSocketEvent('Canvas controller initialized');
	}

	protected handleConnection(socket: Socket): void {
		logSocketEvent('Client connected', { socketId: socket.id });

		socket.on(SOCKET_EVENTS.JOIN_CANVAS, async (data) => {
			await this.handleJoinCanvas(socket, data);
		});

		socket.on(SOCKET_EVENTS.LEAVE_CANVAS, async (data) => {
			await this.handleLeaveCanvas(socket, data);
		});

		socket.on(SOCKET_EVENTS.CURSOR_MOVE, async (data) => {
			await this.handleCursorMove(socket, data);
		});

		socket.on(SOCKET_EVENTS.OBJECT_ADD, async (data) => {
			await this.handleObjectAdd(socket, data);
		});

		socket.on(SOCKET_EVENTS.OBJECT_UPDATE, async (data) => {
			await this.handleObjectUpdate(socket, data);
		});

		socket.on(SOCKET_EVENTS.OBJECT_DELETE, async (data) => {
			await this.handleObjectDelete(socket, data);
		});

		socket.on(SOCKET_EVENTS.DISCONNECT, () => {
			this.handleDisconnect(socket);
		});
	}

	private async handleJoinCanvas(
		socket: Socket,
		data: { canvasId: string; userId: string; userName: string }
	): Promise<void> {
		try {
			const { canvasId, userId, userName } = data;

			const session = await this.sessionService.createSession({
				id: socket.id,
				userId,
				userName,
				canvasId,
				cursorX: 0,
				cursorY: 0,
				color: this.generateUserColor(userId),
				connectedAt: Date.now()
			});

			await socket.join(canvasId);

			const canvasData = await this.service.syncCanvas(canvasId);
			const activeSessions = await this.sessionService.getActiveSessionsByCanvas(canvasId);

			socket.emit(SOCKET_EVENTS.CANVAS_SYNC, {
				canvas: canvasData.canvas,
				objects: canvasData.objects,
				sessions: activeSessions
			});

			socket.to(canvasId).emit(SOCKET_EVENTS.USER_JOINED, {
				session
			});

			logSocketEvent('User joined canvas', { userId, canvasId, socketId: socket.id });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.JOIN_CANVAS });
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error.message,
				code: error.code || 'JOIN_CANVAS_ERROR'
			});
		}
	}

	private async handleLeaveCanvas(
		socket: Socket,
		data: { canvasId: string }
	): Promise<void> {
		try {
			const { canvasId } = data;

			await this.sessionService.deleteSession(socket.id);
			await socket.leave(canvasId);

			socket.to(canvasId).emit(SOCKET_EVENTS.USER_LEFT, {
				sessionId: socket.id
			});

			logSocketEvent('User left canvas', { socketId: socket.id, canvasId });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.LEAVE_CANVAS });
		}
	}

	private async handleCursorMove(
		socket: Socket,
		data: { canvasId: string; x: number; y: number }
	): Promise<void> {
		try {
			const { canvasId, x, y } = data;

			await this.sessionService.updateCursorPosition(socket.id, x, y);

			socket.to(canvasId).emit(SOCKET_EVENTS.CURSOR_MOVE, {
				sessionId: socket.id,
				x,
				y
			});
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.CURSOR_MOVE });
		}
	}

	private async handleObjectAdd(
		socket: Socket,
		data: { canvasId: string; object: CanvasObject }
	): Promise<void> {
		try {
			const { canvasId, object } = data;

			const addedObject = await this.service.addObject(object);

			this.io.to(canvasId).emit(SOCKET_EVENTS.OBJECT_ADD, {
				object: addedObject,
				sessionId: socket.id
			});

			logSocketEvent('Object added', { objectId: addedObject.id, canvasId });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.OBJECT_ADD });
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error.message,
				code: error.code || 'OBJECT_ADD_ERROR'
			});
		}
	}

	private async handleObjectUpdate(
		socket: Socket,
		data: { canvasId: string; objectId: string; updates: Partial<CanvasObject> }
	): Promise<void> {
		try {
			const { canvasId, objectId, updates } = data;

			const updatedObject = await this.service.updateObject(objectId, updates);

			this.io.to(canvasId).emit(SOCKET_EVENTS.OBJECT_UPDATE, {
				object: updatedObject,
				sessionId: socket.id
			});

			logSocketEvent('Object updated', { objectId, canvasId });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.OBJECT_UPDATE });
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error.message,
				code: error.code || 'OBJECT_UPDATE_ERROR'
			});
		}
	}

	private async handleObjectDelete(
		socket: Socket,
		data: { canvasId: string; objectId: string }
	): Promise<void> {
		try {
			const { canvasId, objectId } = data;

			await this.service.deleteObject(objectId);

			this.io.to(canvasId).emit(SOCKET_EVENTS.OBJECT_DELETE, {
				objectId,
				sessionId: socket.id
			});

			logSocketEvent('Object deleted', { objectId, canvasId });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.OBJECT_DELETE });
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error.message,
				code: error.code || 'OBJECT_DELETE_ERROR'
			});
		}
	}

	private async handleDisconnect(socket: Socket): Promise<void> {
		try {
			const session = await this.sessionService.getSessionById(socket.id);
			
			if (session) {
				socket.to(session.canvasId).emit(SOCKET_EVENTS.USER_LEFT, {
					sessionId: socket.id
				});

				await this.sessionService.deleteSession(socket.id);
			}

			logSocketEvent('Client disconnected', { socketId: socket.id });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.DISCONNECT });
		}
	}

	private generateUserColor(userId: string): string {
		const colors = [
			'#3B82F6',
			'#10B981',
			'#F59E0B',
			'#EF4444',
			'#8B5CF6',
			'#EC4899',
			'#14B8A6',
			'#F97316'
		];
		
		const hash = userId.split('').reduce((acc, char) => {
			return char.charCodeAt(0) + ((acc << 5) - acc);
		}, 0);

		return colors[Math.abs(hash) % colors.length];
	}
}

