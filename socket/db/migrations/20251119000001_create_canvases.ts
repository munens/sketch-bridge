import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('canvases', (table) => {
		table.string('id').primary();
		table.string('name').notNullable();
		table.integer('width').notNullable().defaultTo(5000);
		table.integer('height').notNullable().defaultTo(5000);
		table.string('background_color').notNullable().defaultTo('#ffffff');
		table.string('created_by').notNullable();
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

		table.index('created_by');
		table.index('created_at');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('canvases');
}

