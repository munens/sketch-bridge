import type { Knex } from 'knex';

const tableName = 'sessions';

export async function up(knex: Knex): Promise<void> {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
	await knex.schema.createTable(tableName, (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 255).nullable();
		table.decimal('center_latitude', 10, 8).notNullable();
		table.decimal('center_longitude', 11, 8).notNullable();
		table.decimal('bbox_min_latitude', 10, 8).notNullable();
		table.decimal('bbox_max_latitude', 10, 8).notNullable();
		table.decimal('bbox_min_longitude', 11, 8).notNullable();
		table.decimal('bbox_max_longitude', 11, 8).notNullable();
		table.datetime('createdAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('updatedAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('deletedAt', {useTz: true})
			.nullable()
			.defaultTo(null);
		
		// Indexes for geographic queries
		table.index(['center_latitude', 'center_longitude'], 'idx_sessions_center');
		table.index(['name'], 'idx_sessions_name');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(tableName);
	await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}

