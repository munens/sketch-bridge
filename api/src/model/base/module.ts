import {BaseController} from './controller';
import {Knex} from 'knex';

export abstract class BaseModule {

	controller?: BaseController;

  abstract init(knex: Knex): void
}
