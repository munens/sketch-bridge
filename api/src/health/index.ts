import {BaseModule} from '../model';
import {HealthService} from './service';
import {HealthController} from './controller';
import {HealthRepository} from './repository';
import {Knex} from 'knex';

export class HealthModule extends BaseModule {

	repository?: HealthRepository;
	service: HealthService;

	init(knexClient?: Knex) {
		if (knexClient) {
			this.repository = new HealthRepository(knexClient);
		}
		
		this.service = new HealthService(this.repository);
		this.controller = new HealthController(this.service);
	}
}
