import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('active_sessions', (table) => {
		table.string('id').primary();
		table.string('user_id').notNullable();
		table.string('user_name').notNullable();
		table.string('canvas_id').notNullable();
		table.float('cursor_x').notNullable().defaultTo(0);
		table.float('cursor_y').notNullable().defaultTo(0);
		table.string('color').notNullable();
		table.timestamp('connected_at').notNullable().defaultTo(knex.fn.now());
		table.timestamp('last_activity').notNullable().defaultTo(knex.fn.now());

		table.foreign('canvas_id').references('canvases.id').onDelete('CASCADE');
		table.index('canvas_id');
		table.index('user_id');
		table.index('last_activity');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('active_sessions');
}

