export interface Session {
	id: string;
	userId: string;
	userName: string;
	canvasId: string;
	cursorX: number;
	cursorY: number;
	color: string;
	connectedAt: number;
	lastActivity: number;
}

export interface SessionRecord {
	id: string;
	user_id: string;
	user_name: string;
	canvas_id: string;
	cursor_x: number;
	cursor_y: number;
	color: string;
	connected_at: Date;
	last_activity: Date;
}

