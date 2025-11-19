import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('canvas_objects', (table) => {
		table.string('id').primary();
		table.string('canvas_id').notNullable();
		table.string('type').notNullable();
		table.float('x').notNullable();
		table.float('y').notNullable();
		table.float('width').notNullable();
		table.float('height').notNullable();
		table.float('rotation').notNullable().defaultTo(0);
		table.string('fill_color').notNullable();
		table.string('stroke_color').notNullable();
		table.float('stroke_width').notNullable().defaultTo(2);
		table.float('opacity').notNullable().defaultTo(1);
		table.text('path_data').nullable();
		table.text('text_content').nullable();
		table.integer('font_size').nullable();
		table.integer('z_index').notNullable().defaultTo(0);
		table.string('created_by').notNullable();
		table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
		table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

		table.foreign('canvas_id').references('canvases.id').onDelete('CASCADE');
		table.index('canvas_id');
		table.index('z_index');
		table.index('created_at');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('canvas_objects');
}

