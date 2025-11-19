import express from 'express';
import knex, {Knex} from 'knex';
import {corsHandler, errorHandler, requestLogger, logger} from './middleware';
import {BaseModule} from './model';
import {DatabaseConfig} from './database-config';

export class Application {

	private knexClient: Knex;
	private app: express.Application = express();

	constructor(
    private readonly PORT: string,
    private readonly modules: ReadonlyArray<BaseModule>,
    private readonly databaseConfig: DatabaseConfig
	) {}

	init(): void {
		logger.info('🔧 Initializing application...');

		const {
			host,
			port,
			user,
			password,
			database,
			ssl
		} = this.databaseConfig;

		logger.info('🗄️  Connecting to database...');
		this.knexClient = knex({
			client: 'pg',
			connection: {
				host,
				port,
				user,
				password,
				database,
				ssl
			},
			pool: {
				min: 2,
				max: 10
			}
		});

		logger.info('⚙️  Initializing middleware...');
		this.initAppLevelMiddleware();
		
		logger.info(`📦 Initializing ${this.modules.length} module(s)...`);
		this.initModules();
		
		logger.info('🛣️  Setting up routes...');
		this.initRoutes();
		
		logger.info('🛡️  Setting up error handlers...');
		this.initErrorHandlingMiddleware();
		
		this.listen();
	}

	private initAppLevelMiddleware(): void {
		const middlewares = [
			corsHandler(),
			requestLogger(),
			express.json()
		];

		middlewares
			.forEach((middleware) => this.app.use(middleware));
	}

	private initModules(): void {
		this.modules
			.forEach((module) => module.init(this.knexClient));
	}

	private initRoutes(): void {
		this.modules
			.map((module: BaseModule) => module.controller)
			.filter((controller) => controller)
			.forEach((controller) => this.app.use(`/${controller.baseRoute}`, controller.router));
	}

	private initErrorHandlingMiddleware(): void {
		const middlewares = [
			errorHandler
		];

		middlewares
			.forEach((middleware) => this.app.use(middleware));
	}

	private listen(): void {
		const server = this.app.listen(
			this.PORT,
			() => {
				logger.info(`🚀 Server started successfully`);
				logger.info(`📡 Listening on port ${this.PORT || 8090}`);
				logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
				logger.info(`📦 Database: ${this.databaseConfig.database}@${this.databaseConfig.host}:${this.databaseConfig.port}`);
				process.stdout.write(`\n✅ SERVER IS LISTENING ON PORT ${this.PORT}\n\n`);
			}
		);

		server.on('error', (error: any) => {
			logger.error('❌ Server error:', error);
			process.stderr.write(`\n❌ SERVER ERROR: ${error.message}\n${error.stack}\n\n`);
			if (error.code === 'EADDRINUSE') {
				logger.error(`Port ${this.PORT} is already in use`);
				process.exit(1);
			}
		});
	}
}
