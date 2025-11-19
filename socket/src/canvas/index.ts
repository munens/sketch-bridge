import { BaseModule } from '../model';
import { CanvasService } from './service';
import { CanvasController } from './controller';
import { CanvasRepository } from './repository';
import { SessionService } from '../session/service';
import type { Knex } from 'knex';

export class CanvasModule extends BaseModule {
	repository?: CanvasRepository;
	service: CanvasService;

	init(knexClient: Knex, sessionService: SessionService) {
		this.repository = new CanvasRepository(knexClient);
		this.service = new CanvasService(this.repository);
		this.controller = new CanvasController(this.service, sessionService);
	}
}

