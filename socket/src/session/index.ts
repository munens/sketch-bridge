import { BaseModule } from '../model';
import { SessionService } from './service';
import { SessionRepository } from './repository';
import type { Knex } from 'knex';

export class SessionModule extends BaseModule {
	repository?: SessionRepository;
	service: SessionService;

	init(knexClient: Knex) {
		this.repository = new SessionRepository(knexClient);
		this.service = new SessionService(this.repository);
	}
}

export { SessionService } from './service';

