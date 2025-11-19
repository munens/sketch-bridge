import { BaseService } from '../model/base';
import { CanvasRepository } from './repository';
import { Canvas, CanvasObject } from './types';
import { CanvasNotFoundError, CanvasLimitExceededError } from '../model/errors';
import { CANVAS_LIMITS } from '../constants';
import { logSocketSuccess, logSocketError } from '../middleware';

export class CanvasService extends BaseService {
	constructor(protected readonly repository: CanvasRepository) {
		super(repository);
	}

	async createCanvas(
		id: string,
		name: string,
		userId: string
	): Promise<Canvas> {
		try {
			const canvas = await this.repository.createCanvas({
				id,
				name,
				width: 5000,
				height: 5000,
				backgroundColor: '#ffffff',
				createdBy: userId
			});

			logSocketSuccess('Canvas created', { canvasId: canvas.id, userId });
			return canvas;
		} catch (error) {
			logSocketError(error, { operation: 'createCanvas', canvasId: id });
			throw error;
		}
	}

	async getCanvas(canvasId: string): Promise<Canvas> {
		const canvas = await this.repository.getCanvasById(canvasId);
		
		if (!canvas) {
			throw new CanvasNotFoundError(canvasId);
		}

		return canvas;
	}

	async getOrCreateCanvas(
		canvasId: string,
		userId: string,
		canvasName?: string
	): Promise<Canvas> {
		try {
			const canvas = await this.repository.getCanvasById(canvasId);
			
			if (canvas) {
				return canvas;
			}

			// Canvas doesn't exist, create it
			return await this.createCanvas(
				canvasId,
				canvasName || `Canvas ${canvasId.substring(0, 8)}`,
				userId
			);
		} catch (error) {
			logSocketError(error, { operation: 'getOrCreateCanvas', canvasId });
			throw error;
		}
	}

	async addObject(object: CanvasObject): Promise<CanvasObject> {
		const count = await this.repository.getObjectCount(object.canvasId);
		
		if (count >= CANVAS_LIMITS.MAX_OBJECTS_PER_CANVAS) {
			throw new CanvasLimitExceededError(CANVAS_LIMITS.MAX_OBJECTS_PER_CANVAS);
		}

		const addedObject = await this.repository.addObject(object);
		logSocketSuccess('Object added', { 
			objectId: addedObject.id, 
			canvasId: addedObject.canvasId 
		});

		return addedObject;
	}

	async updateObject(
		objectId: string,
		updates: Partial<CanvasObject>
	): Promise<CanvasObject> {
		const updatedObject = await this.repository.updateObject(objectId, updates);
		logSocketSuccess('Object updated', { objectId });

		return updatedObject;
	}

	async deleteObject(objectId: string): Promise<void> {
		await this.repository.deleteObject(objectId);
		logSocketSuccess('Object deleted', { objectId });
	}

	async getCanvasObjects(canvasId: string): Promise<CanvasObject[]> {
		return await this.repository.getObjectsByCanvasId(canvasId);
	}

	async syncCanvas(canvasId: string): Promise<{
		canvas: Canvas;
		objects: CanvasObject[];
	}> {
		const [canvas, objects] = await Promise.all([
			this.getCanvas(canvasId),
			this.getCanvasObjects(canvasId)
		]);

		return { canvas, objects };
	}
}

