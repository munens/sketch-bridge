import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import knex from 'knex';
import type { Knex } from 'knex';
import cors from 'cors';
import { BaseModule } from './model';
import { DatabaseConfig } from './database-config';
import { logger } from './middleware';
import { SessionModule } from './session';
import { CanvasModule } from './canvas';

export class SocketApplication {
	private knexClient: Knex;
	private app: express.Application = express();
	private httpServer: ReturnType<typeof createServer>;
	private io: Server;
	private modules: BaseModule[] = [];

	constructor(
		private readonly PORT: string,
		private readonly databaseConfig: DatabaseConfig,
		private readonly corsOrigin: string
	) {}

	init(): void {
		logger.info('🔧 Initializing socket application...');

		this.initDatabase();
		this.initExpress();
		this.initSocketIO();
		this.initModules();
		this.listen();
	}

	private initDatabase(): void {
		const { host, port, user, password, database, ssl } = this.databaseConfig;

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
	}

	private initExpress(): void {
		logger.info('⚙️  Initializing Express...');
		
		this.app.use(cors({
			origin: this.corsOrigin,
			methods: ['GET', 'POST'],
			credentials: true
		}));

		this.app.use(express.json());

		this.app.get('/health', (req, res) => {
			res.json({
				status: 'healthy',
				timestamp: new Date().toISOString(),
				uptime: process.uptime()
			});
		});

		this.httpServer = createServer(this.app);
	}

	private initSocketIO(): void {
		logger.info('🔌 Initializing Socket.IO...');

		this.io = new Server(this.httpServer, {
			cors: {
				origin: this.corsOrigin,
				methods: ['GET', 'POST'],
				credentials: true
			},
			pingTimeout: 60000,
			pingInterval: 25000
		});

		this.io.on('connection', (socket) => {
			logger.info('Client connected', { socketId: socket.id });
		});
	}

	private initModules(): void {
		logger.info('📦 Initializing modules...');

		const sessionModule = new SessionModule();
		sessionModule.init(this.knexClient);

		const canvasModule = new CanvasModule();
		canvasModule.init(this.knexClient, sessionModule.service);

		if (canvasModule.controller) {
			canvasModule.controller.init(this.io);
		}

		this.modules = [sessionModule, canvasModule];
	}

	private listen(): void {
		this.httpServer.listen(this.PORT, () => {
			logger.info('🚀 Socket server started successfully');
			logger.info(`📡 Listening on port ${this.PORT}`);
			logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
			logger.info(`📦 Database: ${this.databaseConfig.database}@${this.databaseConfig.host}:${this.databaseConfig.port}`);
			logger.info(`🔗 CORS Origin: ${this.corsOrigin}`);
			process.stdout.write(`\n✅ SOCKET SERVER IS LISTENING ON PORT ${this.PORT}\n\n`);
		});

		this.httpServer.on('error', (error: any) => {
			logger.error('❌ Server error:', error);
			process.stderr.write(`\n❌ SERVER ERROR: ${error.message}\n${error.stack}\n\n`);
			if (error.code === 'EADDRINUSE') {
				logger.error(`Port ${this.PORT} is already in use`);
				process.exit(1);
			}
		});
	}

	getIO(): Server {
		return this.io;
	}
}

