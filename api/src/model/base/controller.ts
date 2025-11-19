import {Router} from 'express';
import {BaseService} from './service';

export abstract class BaseController {

	abstract readonly baseRoute: string;
	abstract readonly router: Router;

	protected abstract readonly service: BaseService;

	protected abstract initRoutes(): void
}
