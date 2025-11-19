import { Server, Socket } from 'socket.io';
import { BaseController } from '../model';
import { CanvasService } from './service';
import { SessionService } from '../session';
import { SOCKET_EVENTS } from '../constants';
import { logSocketEvent, logSocketError } from '../middleware';

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

		socket.on(SOCKET_EVENTS.CLEAR_CANVAS, async (data) => {
			await this.handleClearCanvas(socket, data);
		});

		socket.on(SOCKET_EVENTS.AI_ANALYZE, async (data) => {
			await this.handleAIAnalyze(socket, data);
		});

		socket.on(SOCKET_EVENTS.DISCONNECT, () => {
			this.handleDisconnect(socket);
		});
	}

	private async handleJoinCanvas(
		socket: Socket,
		data: { canvasId: string; userId: string; userName: string; canvasName?: string }
	): Promise<void> {
		try {
			const { canvasId, userId, userName, canvasName } = data;

			// Ensure the canvas exists (create if it doesn't)
			await this.service.getOrCreateCanvas(canvasId, userId, canvasName);

			// Clean up any existing sessions for this user on this canvas
			// This handles cases where the user refreshed the page or had a stale connection
			const oldSessions = await this.sessionService.getUserSessionsFromCanvas(userId, canvasId);
			if (oldSessions.length > 0) {
				// Delete old sessions from database
				await this.sessionService.deleteUserSessionsFromCanvas(userId, canvasId);
				
				// Notify other users that each old session is gone
				for (const oldSession of oldSessions) {
					this.io.to(canvasId).emit(SOCKET_EVENTS.USER_LEFT, {
						sessionId: oldSession.id
					});
				}
				
				logSocketEvent('Cleaned up stale sessions before join', { 
					userId, 
					canvasId, 
					count: oldSessions.length 
				});
			}

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
		data: { canvasId: string; object: any }
	): Promise<void> {
		try {
			const { canvasId, object } = data;

			console.log('[Socket Controller] handleObjectAdd - received:', {
				canvasId,
				objectId: object.id,
				objectType: object.type,
				socketId: socket.id,
				hasImageData: !!object.imageData,
				imageDataLength: object.imageData?.length || 0
			});

			const session = await this.sessionService.getSessionById(socket.id);
			if (!session) {
				throw new Error('Session not found');
			}

			const objectWithMeta = {
				...object,
				canvasId,
				createdBy: session.userId,
				updatedAt: Date.now()
			};

			console.log('[Socket Controller] Saving object with meta:', {
				objectId: objectWithMeta.id,
				createdBy: objectWithMeta.createdBy,
				hasImageData: !!objectWithMeta.imageData
			});

			const addedObject = await this.service.addObject(objectWithMeta);

			console.log('[Socket Controller] Object saved, broadcasting to room:', canvasId);

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
		data: { canvasId: string; objectId: string; updates: any }
	): Promise<void> {
		try {
			const { canvasId, objectId, updates } = data;

			const updatesWithMeta = {
				...updates,
				updatedAt: Date.now()
			};

			const updatedObject = await this.service.updateObject(objectId, updatesWithMeta);

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

	private async handleClearCanvas(
		socket: Socket,
		data: { canvasId: string }
	): Promise<void> {
		try {
			const { canvasId } = data;

			await this.service.clearCanvas(canvasId);

			this.io.to(canvasId).emit(SOCKET_EVENTS.CLEAR_CANVAS, {
				sessionId: socket.id
			});

			logSocketEvent('Canvas cleared', { canvasId });
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.CLEAR_CANVAS });
			socket.emit(SOCKET_EVENTS.ERROR, {
				message: error.message,
				code: error.code || 'CLEAR_CANVAS_ERROR'
			});
		}
	}

	private async handleDisconnect(socket: Socket): Promise<void> {
		try {
			const session = await this.sessionService.getSessionById(socket.id);
			
			if (session) {
				await this.sessionService.deleteSession(socket.id);
				
				socket.to(session.canvasId).emit(SOCKET_EVENTS.USER_LEFT, {
					sessionId: socket.id
				});

				logSocketEvent('Client disconnected and session cleaned up', { 
					socketId: socket.id, 
					userId: session.userId 
				});
			} else {
				logSocketEvent('Client disconnected (no active session)', { socketId: socket.id });
			}
		} catch (error) {
			logSocketError(error, { event: SOCKET_EVENTS.DISCONNECT, socketId: socket.id });
		}
	}

	private async handleAIAnalyze(
		socket: Socket,
		data: { imageBase64: string }
	): Promise<void> {
		try {
			logSocketEvent('AI analysis requested', { socketId: socket.id });
			
			const { imageBase64 } = data;
			
			if (!imageBase64) {
				socket.emit(SOCKET_EVENTS.AI_ERROR, {
					error: 'No image data provided'
				});
				return;
			}
			
			// Emit progress update
			socket.emit(SOCKET_EVENTS.AI_PROGRESS, {
				status: 'Analyzing image with OpenAI GPT-4 Vision...'
			});
			
			// Analyze with OpenAI
			const result = await this.service.analyzeImage(imageBase64, (status) => {
				socket.emit(SOCKET_EVENTS.AI_PROGRESS, { status });
			});
			
			// Emit result
			socket.emit(SOCKET_EVENTS.AI_RESULT, result);
			
			logSocketEvent('AI analysis complete', { 
				socketId: socket.id,
				components: result.detectedComponents,
				confidence: result.confidence
			});
			
		} catch (error) {
			logSocketError(error, { 
				event: SOCKET_EVENTS.AI_ANALYZE, 
				socketId: socket.id 
			});
			
			socket.emit(SOCKET_EVENTS.AI_ERROR, {
				error: error instanceof Error ? error.message : 'AI analysis failed'
			});
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

