import { BaseRepository } from './repository';

export abstract class BaseService {
	constructor(protected readonly repository?: BaseRepository) {}
}

