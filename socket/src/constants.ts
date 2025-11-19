export const SOCKET_EVENTS = {
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',
	JOIN_CANVAS: 'join_canvas',
	LEAVE_CANVAS: 'leave_canvas',
	CURSOR_MOVE: 'cursor_move',
	OBJECT_ADD: 'object_add',
	OBJECT_UPDATE: 'object_update',
	OBJECT_DELETE: 'object_delete',
	CLEAR_CANVAS: 'clear_canvas',
	CANVAS_SYNC: 'canvas_sync',
	USER_JOINED: 'user_joined',
	USER_LEFT: 'user_left',
	// AI Analysis events
	AI_ANALYZE: 'ai_analyze',
	AI_PROGRESS: 'ai_progress',
	AI_RESULT: 'ai_result',
	AI_ERROR: 'ai_error',
	ERROR: 'error'
} as const;

export const CANVAS_LIMITS = {
	MAX_OBJECTS_PER_CANVAS: 1000,
	MAX_ACTIVE_USERS_PER_CANVAS: 50,
	SESSION_TIMEOUT_MS: 30 * 60 * 1000
} as const;

