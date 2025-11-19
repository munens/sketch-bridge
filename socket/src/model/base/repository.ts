import type { Knex } from 'knex';

export abstract class BaseRepository {
	protected constructor(
		protected readonly knexClient: Knex,
		protected readonly tableName?: string
	) {}
}

