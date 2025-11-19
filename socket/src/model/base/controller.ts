import { Server, Socket } from 'socket.io';
import { BaseService } from './service';

export abstract class BaseController {
	abstract readonly namespace: string;

	protected abstract readonly service: BaseService;

	abstract init(io: Server): void;

	protected abstract handleConnection(socket: Socket): void;
}

