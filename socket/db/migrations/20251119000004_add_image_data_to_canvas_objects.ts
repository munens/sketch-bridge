import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('canvas_objects', (table) => {
		table.text('image_data').nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('canvas_objects', (table) => {
		table.dropColumn('image_data');
	});
}

