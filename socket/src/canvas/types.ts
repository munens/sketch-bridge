export interface Point {
	x: number;
	y: number;
}

export interface CanvasObject {
	id: string;
	canvasId: string;
	type: 'rect' | 'circle' | 'path' | 'text';
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	fillColor: string;
	strokeColor: string;
	strokeWidth: number;
	opacity: number;
	pathData?: string;
	textContent?: string;
	fontSize?: number;
	zIndex: number;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
}

export interface Canvas {
	id: string;
	name: string;
	width: number;
	height: number;
	backgroundColor: string;
	createdBy: string;
	createdAt: number;
	updatedAt: number;
}

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

