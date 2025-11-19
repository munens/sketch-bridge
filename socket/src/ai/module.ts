import { BaseModule } from '../model';
import { AIService } from './service';
import { logger } from '../middleware';

/**
 * AI Module - provides component analysis using OpenAI GPT-4 Vision
 * 
 * This module can be used independently or as a dependency for other modules
 * that need AI-powered component recognition capabilities.
 */
export class AIModule extends BaseModule {
  service: AIService;

  init(): void {
    logger.info('🤖 Initializing AI module...');
    
    this.service = new AIService();
    
    if (this.service.isAvailable()) {
      const components = this.service.getAvailableComponents();
      logger.info(`✨ AI Service initialized successfully`);
      logger.info(`📚 Loaded ${components.length} components into knowledge base`);
    } else {
      logger.warn('⚠️  AI Service not available - OPENAI_API_KEY not configured');
      logger.warn('   Add OPENAI_API_KEY to environment to enable AI component analysis');
    }
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.service?.isAvailable() ?? false;
  }
}

