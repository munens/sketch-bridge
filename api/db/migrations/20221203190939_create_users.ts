import type { Knex } from 'knex';

const tableName = 'users';

export async function up(knex: Knex): Promise<void> {
	await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
	await knex.schema.createTable(tableName, (table) => {
		table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
		table.string('name', 255);
		table.datetime('createdAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('updatedAt', {useTz: true}).defaultTo(knex.fn.now());
		table.datetime('deletedAt', {useTz: true})
			.nullable()
			.defaultTo(null);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable(tableName);
	await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
}

