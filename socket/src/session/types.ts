export type { Session } from '../../../common/model';

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

