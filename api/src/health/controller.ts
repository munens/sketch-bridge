import {Router, Request, Response, NextFunction} from 'express';
import {BaseController} from '../model';
import {HealthService} from './service';
import {logControllerError, logControllerSuccess} from '../middleware';

export class HealthController extends BaseController {
	readonly baseRoute = 'health';
	readonly router: Router = Router({mergeParams: true});

	constructor(protected readonly service: HealthService) {
		super();
		this.initRoutes();
	}

	protected initRoutes(): void {
		
		this.router.get('/', async (req: Request, res: Response, next: NextFunction) => {
			const startTime = Date.now();
			const operation = 'simpleHealthCheck';

			try {
				const status = await this.service.getSimpleStatus();

				logControllerSuccess('Simple health check completed', {
					requestId: req.requestId,
					operation,
					duration: Date.now() - startTime,
					data: {
						status: status.status
					}
				});
				
				const httpStatus = status.status === 'healthy'
					? 200
					: status.status === 'degraded' ? 200 : 503;

				res.status(httpStatus).json({
					success: true,
					data: status,
					meta: {
						requestId: req.requestId,
						timestamp: new Date().toISOString()
					}
				});

			} catch (err) {
				logControllerError(err, {
					requestId: req.requestId,
					operation,
					duration: Date.now() - startTime
				});

				err.requestId = req.requestId;
				err.operation = operation;
				next(err);
			}
		});
	}
}
