import type { Knex } from 'knex';
import { BaseRepository } from '../model/base';
import { Canvas, CanvasObject, CanvasObjectRecord, CanvasRecord } from './types';
import { logSocketError, logSocketSuccess } from '../middleware';

export class CanvasRepository extends BaseRepository {
	private readonly canvasTableName = 'canvases';
	private readonly objectsTableName = 'canvas_objects';

	constructor(knexClient: Knex) {
		super(knexClient);
	}

	async createCanvas(canvas: Omit<Canvas, 'createdAt' | 'updatedAt'>): Promise<Canvas> {
		try {
			const [record] = await this.knexClient<CanvasRecord>(this.canvasTableName)
				.insert({
					id: canvas.id,
					name: canvas.name,
					width: canvas.width,
					height: canvas.height,
					background_color: canvas.backgroundColor,
					created_by: canvas.createdBy,
					created_at: new Date(),
					updated_at: new Date()
				})
				.returning('*');

			return this.mapCanvasRecordToCanvas(record);
		} catch (error) {
			logSocketError(error, { operation: 'createCanvas', canvasId: canvas.id });
			throw error;
		}
	}

	async getCanvasById(canvasId: string): Promise<Canvas | null> {
		try {
			const record = await this.knexClient<CanvasRecord>(this.canvasTableName)
				.where({ id: canvasId })
				.first();

			return record ? this.mapCanvasRecordToCanvas(record) : null;
		} catch (error) {
			logSocketError(error, { operation: 'getCanvasById', canvasId });
			throw error;
		}
	}

	async addObject(object: CanvasObject): Promise<CanvasObject> {
		try {
			console.log('[Canvas Repository] Adding object:', {
				id: object.id,
				type: object.type,
				hasImageData: !!(object as any).imageData,
				imageDataLength: (object as any).imageData?.length || 0
			});

			const [record] = await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.insert({
					id: object.id,
					canvas_id: object.canvasId,
					type: object.type,
					x: object.x,
					y: object.y,
					width: object.width,
					height: object.height,
					rotation: object.rotation,
					fill_color: object.fillColor,
					stroke_color: object.strokeColor,
					stroke_width: object.strokeWidth,
					opacity: object.opacity,
					path_data: object.pathData,
					text_content: object.textContent,
					font_size: object.fontSize,
					image_data: (object as any).imageData,  // Save base64 image data
					z_index: object.zIndex,
					created_by: object.createdBy,
					created_at: new Date(object.createdAt),
					updated_at: new Date(object.updatedAt)
				})
				.returning('*');

			const mappedObject = this.mapObjectRecordToObject(record);
			console.log('[Canvas Repository] Object saved and mapped:', {
				id: mappedObject.id,
				hasImageData: !!(mappedObject as any).imageData
			});

			return mappedObject;
		} catch (error) {
			logSocketError(error, { operation: 'addObject', objectId: object.id });
			throw error;
		}
	}

	async updateObject(objectId: string, updates: Partial<CanvasObject>): Promise<CanvasObject> {
		try {
			const updateData: any = { updated_at: new Date() };

			if (updates.x !== undefined) updateData.x = updates.x;
			if (updates.y !== undefined) updateData.y = updates.y;
			if (updates.width !== undefined) updateData.width = updates.width;
			if (updates.height !== undefined) updateData.height = updates.height;
			if (updates.rotation !== undefined) updateData.rotation = updates.rotation;
			if (updates.fillColor !== undefined) updateData.fill_color = updates.fillColor;
			if (updates.strokeColor !== undefined) updateData.stroke_color = updates.strokeColor;
			if (updates.strokeWidth !== undefined) updateData.stroke_width = updates.strokeWidth;
			if (updates.opacity !== undefined) updateData.opacity = updates.opacity;
			if (updates.zIndex !== undefined) updateData.z_index = updates.zIndex;
			if (updates.pathData !== undefined) updateData.path_data = updates.pathData;
			if (updates.textContent !== undefined) updateData.text_content = updates.textContent;
			if (updates.fontSize !== undefined) updateData.font_size = updates.fontSize;
			if ((updates as any).imageData !== undefined) updateData.image_data = (updates as any).imageData;

			const [record] = await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.where({ id: objectId })
				.update(updateData)
				.returning('*');

			return this.mapObjectRecordToObject(record);
		} catch (error) {
			logSocketError(error, { operation: 'updateObject', objectId });
			throw error;
		}
	}

	async deleteObject(objectId: string): Promise<void> {
		try {
			await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.where({ id: objectId })
				.delete();
		} catch (error) {
			logSocketError(error, { operation: 'deleteObject', objectId });
			throw error;
		}
	}

	async deleteAllObjects(canvasId: string): Promise<void> {
		try {
			const deletedCount = await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.where({ canvas_id: canvasId })
				.delete();

			logSocketSuccess('All objects deleted from canvas', { canvasId, count: deletedCount });
		} catch (error) {
			logSocketError(error, { operation: 'deleteAllObjects', canvasId });
			throw error;
		}
	}

	async getObjectsByCanvasId(canvasId: string): Promise<CanvasObject[]> {
		try {
			const records = await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.where({ canvas_id: canvasId })
				.orderBy('z_index', 'asc');

			return records.map(record => this.mapObjectRecordToObject(record));
		} catch (error) {
			logSocketError(error, { operation: 'getObjectsByCanvasId', canvasId });
			throw error;
		}
	}

	async getObjectCount(canvasId: string): Promise<number> {
		try {
			const result = await this.knexClient<CanvasObjectRecord>(this.objectsTableName)
				.where({ canvas_id: canvasId })
				.count('* as count')
			.first() as { count?: string | number } | undefined;

			return Number(result?.count || 0);
		} catch (error) {
			logSocketError(error, { operation: 'getObjectCount', canvasId });
			throw error;
		}
	}

	private mapCanvasRecordToCanvas(record: CanvasRecord): Canvas {
		return {
			id: record.id,
			name: record.name,
			width: record.width,
			height: record.height,
			backgroundColor: record.background_color,
			createdBy: record.created_by,
			createdAt: new Date(record.created_at).getTime(),
			updatedAt: new Date(record.updated_at).getTime()
		};
	}

	private mapObjectRecordToObject(record: CanvasObjectRecord): CanvasObject {
		const obj: any = {
			id: record.id,
			canvasId: record.canvas_id,
			type: record.type as any,
			x: record.x,
			y: record.y,
			width: record.width,
			height: record.height,
			rotation: record.rotation,
			fillColor: record.fill_color,
			strokeColor: record.stroke_color,
			strokeWidth: record.stroke_width,
			opacity: record.opacity,
			pathData: record.path_data,
			textContent: record.text_content,
			fontSize: record.font_size,
			zIndex: record.z_index,
			createdBy: record.created_by,
			createdAt: new Date(record.created_at).getTime(),
			updatedAt: new Date(record.updated_at).getTime()
		};

		// Include imageData if present
		if (record.image_data) {
			obj.imageData = record.image_data;
		}

		return obj;
	}
}

