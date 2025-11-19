import { Knex } from 'knex';

/**
 * Database helper utilities for integration tests
 */
export class DatabaseHelpers {
	constructor(private knex: Knex) {}

	/**
   * Clean all test data from the database
   */
	async cleanAllTables(): Promise<void> {
		const tables = [
			'card_scores',
			'card_template_categories', 
			'cards',
			'card_templates',
			'games',
			'categories',
			'game_types'
		];

		// Disable foreign key checks temporarily
		await this.knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    
		try {
			for (const table of tables) {
				await this.knex(table).del();
			}
		} finally {
			// Re-enable foreign key checks
			await this.knex.raw('SET FOREIGN_KEY_CHECKS = 1');
		}
	}

	/**
   * Create a test game type
   */
	async createTestGameType(data: Partial<{
    name: string;
    gameLength: number;
    questionCount: number;
  }> = {}): Promise<{ id: number }> {
		const gameType = {
			name: data.name || 'Test Game Type',
			gameLength: data.gameLength || 30,
			questionCount: data.questionCount || 5,
			createdAt: new Date()
		};

		const result = await this.knex('game_types')
			.insert(gameType)
			.returning('id');
    
		return { id: result[0].id };
	}

	/**
   * Create a test category
   */
	async createTestCategory(gameTypeId: number, data: Partial<{
    name: string;
    description: string;
    callout: string;
  }> = {}): Promise<{ id: number }> {
		const category = {
			name: data.name || 'Test Category',
			description: data.description || 'Test Description',
			callout: data.callout || 'Test!',
			gameTypeId,
			createdAt: new Date()
		};

		const result = await this.knex('categories')
			.insert(category)
			.returning('id');
    
		return { id: result[0].id };
	}

	/**
   * Create test card templates
   */
	async createTestCardTemplates(count = 5): Promise<{ ids: number[] }> {
		const cardTemplates = Array.from({ length: count }, (_, i) => ({
			prompt: `Test Question ${i + 1}`,
			isActive: true,
			createdAt: new Date()
		}));

		const results = await this.knex('card_templates')
			.insert(cardTemplates)
			.returning('id');
    
		return { ids: results.map(r => r.id) };
	}

	/**
   * Link card templates to a category
   */
	async linkCardTemplatesToCategory(cardTemplateIds: number[], categoryId: number): Promise<void> {
		const links = cardTemplateIds.map(ctId => ({
			cardTemplateId: ctId,
			categoryId,
			createdAt: new Date()
		}));

		await this.knex('card_template_categories').insert(links);
	}

	/**
   * Create a test game
   */
	async createTestGame(gameTypeId: number, categoryId: number, data: Partial<{
    score: number;
    completedAt: Date | null;
  }> = {}): Promise<{ id: number }> {
		const game = {
			gameTypeId,
			categoryId,
			score: data.score || 0,
			createdAt: new Date(),
			completedAt: data.completedAt || null
		};

		const result = await this.knex('games')
			.insert(game)
			.returning('id');
    
		return { id: result[0].id };
	}

	/**
   * Create test cards for a game
   */
	async createTestCards(gameId: number, cardTemplateIds: number[]): Promise<{ ids: number[] }> {
		const cards = cardTemplateIds.map(ctId => ({
			cardTemplateId: ctId,
			gameId,
			createdAt: new Date()
		}));

		const results = await this.knex('cards')
			.insert(cards)
			.returning('id');
    
		return { ids: results.map(r => r.id) };
	}

	/**
   * Create test card scores
   */
	async createTestCardScores(cardIds: number[], gameId: number, score: number | null = null): Promise<void> {
		const cardScores = cardIds.map(cardId => ({
			cardId,
			gameId,
			score,
			createdAt: new Date()
		}));

		await this.knex('card_scores').insert(cardScores);
	}

	/**
   * Get game by ID
   */
	async getGame(gameId: number): Promise<any> {
		return await this.knex('games')
			.where('id', gameId)
			.first();
	}

	/**
   * Get card score by card ID
   */
	async getCardScore(cardId: number): Promise<any> {
		return await this.knex('card_scores')
			.where('cardId', cardId)
			.first();
	}

	/**
   * Wait for database operations to complete
   */
	async waitForDatabase(timeout = 5000): Promise<void> {
		const start = Date.now();
    
		while (Date.now() - start < timeout) {
			try {
				await this.knex.raw('SELECT 1');
				return;
			} catch (error) {
				await new Promise(resolve => setTimeout(resolve, 100));
			}
		}
    
		throw new Error(`Database not ready after ${timeout}ms`);
	}
} 