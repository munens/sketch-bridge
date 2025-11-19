import type { Knex } from 'knex';

const tableName = 'users_sessions';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable(tableName, (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		
		// Foreign keys
		table.uuid('userId').notNullable();
		table.uuid('sessionId').notNullable();
		
		// Timestamps
		table.datetime('createdAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('updatedAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('deletedAt', {useTz: true})
			.nullable()
			.defaultTo(null);
		
		// Foreign key constraints
		table.foreign('userId')
			.references('id')
			.inTable('users')
			.onDelete('CASCADE')
			.onUpdate('CASCADE');
		
		table.foreign('sessionId')
			.references('id')
			.inTable('sessions')
			.onDelete('CASCADE')
			.onUpdate('CASCADE');
		
		// Ensure a user can't join the same session twice
		table.unique(['userId', 'sessionId']);
		
		// Indexes for better query performance
		table.index(['userId'], 'idx_users_sessions_userId');
		table.index(['sessionId'], 'idx_users_sessions_sessionId');
		table.index(['userId', 'sessionId'], 'idx_users_sessions_composite');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(tableName);
}

