export { Point, CanvasObject, Canvas, Session } from '@sketch-bridge/common/model';

export interface CanvasObjectRecord {
	id: string;
	canvas_id: string;
	type: string;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	fill_color: string;
	stroke_color: string;
	stroke_width: number;
	opacity: number;
	path_data?: string;
	text_content?: string;
	font_size?: number;
	z_index: number;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

export interface CanvasRecord {
	id: string;
	name: string;
	width: number;
	height: number;
	background_color: string;
	created_by: string;
	created_at: Date;
	updated_at: Date;
}

