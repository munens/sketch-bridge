import knex, { Knex } from 'knex';
import dotenv from 'dotenv';


dotenv.config({ path: '.env.test' });

export default async function globalSetup() {
	console.log('🔧 Setting up integration test environment...');

	let knexClient: Knex | null = null;

	try {
    
		knexClient = knex({
			client: 'pg',
			connection: {
				host: process.env.TEST_DB_HOST || 'localhost',
				port: parseInt(process.env.TEST_DB_PORT || '5432'),
				user: process.env.TEST_DB_USER || 'postgres',
				password: process.env.TEST_DB_PASSWORD || 'password',
        
			},
		});

		const testDbName = process.env.TEST_DB_NAME || 'cheza_test';

    
		const databases = await knexClient.raw(`
      SELECT datname FROM pg_database WHERE datname = ?
    `, [testDbName]);

		if (databases.rows.length === 0) {
			console.log(`📦 Creating test database: ${testDbName}`);
			await knexClient.raw('CREATE DATABASE ??', [testDbName]);
		} else {
			console.log(`📦 Test database already exists: ${testDbName}`);
		}

		await knexClient.destroy();

    
		knexClient = knex({
			client: 'pg',
			connection: {
				host: process.env.TEST_DB_HOST || 'localhost',
				port: parseInt(process.env.TEST_DB_PORT || '5432'),
				user: process.env.TEST_DB_USER || 'postgres',
				password: process.env.TEST_DB_PASSWORD || 'password',
				database: testDbName,
			},
		});

		console.log('🏗️  Running database migrations...');
    
    
		await knexClient.schema.dropTableIfExists('card_scores');
		await knexClient.schema.dropTableIfExists('card_template_categories');
		await knexClient.schema.dropTableIfExists('cards');
		await knexClient.schema.dropTableIfExists('card_templates');
		await knexClient.schema.dropTableIfExists('games');
		await knexClient.schema.dropTableIfExists('categories');
		await knexClient.schema.dropTableIfExists('game_types');

    
		await knexClient.schema.createTable('game_types', (table) => {
			table.increments('id').primary();
			table.string('name').notNullable();
			table.integer('gameLength').notNullable();
			table.integer('questionCount').notNullable();
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
		});

    
		await knexClient.schema.createTable('categories', (table) => {
			table.increments('id').primary();
			table.string('name').notNullable();
			table.text('description').nullable();
			table.string('callout').nullable();
			table.integer('gameTypeId').references('id').inTable('game_types').onDelete('CASCADE');
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
		});

    
		await knexClient.schema.createTable('games', (table) => {
			table.increments('id').primary();
			table.integer('gameTypeId').references('id').inTable('game_types').onDelete('CASCADE');
			table.integer('categoryId').references('id').inTable('categories').onDelete('CASCADE');
			table.integer('score').defaultTo(0);
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('completedAt').nullable();
			table.timestamp('deletedAt').nullable();
		});

    
		await knexClient.schema.createTable('card_templates', (table) => {
			table.increments('id').primary();
			table.text('prompt').notNullable();
			table.boolean('isActive').defaultTo(true);
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
		});

    
		await knexClient.schema.createTable('cards', (table) => {
			table.increments('id').primary();
			table.integer('cardTemplateId').references('id').inTable('card_templates').onDelete('CASCADE');
			table.integer('gameId').references('id').inTable('games').onDelete('CASCADE');
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
		});

    
		await knexClient.schema.createTable('card_template_categories', (table) => {
			table.increments('id').primary();
			table.integer('cardTemplateId').references('id').inTable('card_templates').onDelete('CASCADE');
			table.integer('categoryId').references('id').inTable('categories').onDelete('CASCADE');
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
			table.unique(['cardTemplateId', 'categoryId']);
		});

    
		await knexClient.schema.createTable('card_scores', (table) => {
			table.increments('id').primary();
			table.integer('cardId').references('id').inTable('cards').onDelete('CASCADE');
			table.integer('gameId').references('id').inTable('games').onDelete('CASCADE');
			table.integer('score').nullable(); 
			table.timestamp('createdAt').defaultTo(knexClient.fn.now());
			table.timestamp('updatedAt').defaultTo(knexClient.fn.now());
			table.timestamp('deletedAt').nullable();
			table.unique(['cardId', 'gameId']);
		});

		console.log('✅ Database setup completed');

	} catch (error) {
		console.error('❌ Error setting up test database:', error);
		throw error;
	} finally {
		if (knexClient) {
			await knexClient.destroy();
		}
	}
} 