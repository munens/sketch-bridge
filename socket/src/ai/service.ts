import OpenAI from 'openai';
import { BaseService } from '../model/base';
import { COMPONENT_KNOWLEDGE_BASE } from './component-knowledge-base';
import { AIAnalysisResult, ProgressCallback, ComponentKnowledge } from './types';
import { logSocketSuccess, logSocketError } from '../middleware';

/**
 * AI Service for component analysis using OpenAI GPT-4 Vision
 */
export class AIService extends BaseService {
  private client: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor(apiKey?: string) {
    super(null as any); // AI service doesn't use repository
    
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (key) {
      this.client = new OpenAI({ apiKey: key });
      this.isConfigured = true;
      console.log('[AI Service] Initialized with OpenAI API key');
    } else {
      console.warn('[AI Service] No OPENAI_API_KEY found in environment');
    }
  }

  /**
   * Check if AI service is configured
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Get all available components from knowledge base
   */
  getAvailableComponents(): ComponentKnowledge[] {
    return COMPONENT_KNOWLEDGE_BASE;
  }

  /**
   * Get component by ID
   */
  getComponentById(id: string): ComponentKnowledge | undefined {
    return COMPONENT_KNOWLEDGE_BASE.find(comp => comp.id === id);
  }

  /**
   * Generate comprehensive prompt for OpenAI with component library documentation
   */
  private generatePrompt(): string {
    const componentDescriptions = COMPONENT_KNOWLEDGE_BASE.map(comp => `
## ${comp.name} (${comp.id})
Category: ${comp.category}
Description: ${comp.description}

Visual Appearance:
${comp.visualDescription}

Visual Characteristics:
- Colors: ${comp.visualCharacteristics.colors.join(', ')}
- Spacing: ${comp.visualCharacteristics.spacing.join(', ')}
- Borders: ${comp.visualCharacteristics.borders.join(', ')}

Props:
${comp.props.map(p => `- ${p.name}: ${p.type}${p.required ? ' (required)' : ''}`).join('\n')}

Source Code:
\`\`\`typescript
${comp.sourceCode}
\`\`\`

Usage Example:
\`\`\`tsx
${comp.usageExamples[0]?.code || ''}
\`\`\`
    `).join('\n---\n');

    return `You are analyzing UI screenshots to identify components from this React/TypeScript library.

Available Components:
${componentDescriptions}

IMPORTANT INSTRUCTIONS:
1. Look for NESTED component structures (e.g., Button inside Panel, TextField inside OverlayPanel)
2. Pay attention to container components (Panel, OverlayPanel, Layout) that wrap other components
3. Identify component hierarchy: which components are children of others
4. Generate code that reflects this nesting structure accurately

Common Patterns to Look For:
- Buttons, TextFields, or TextSearch INSIDE Panels or OverlayPanels
- Multiple form inputs grouped together in a container
- Search components with dropdowns showing results

Task: Analyze the provided screenshot and identify which components are used AND how they are nested.

Return ONLY valid JSON in this format:
{
  "detectedComponents": ["component-id-1", "component-id-2"],
  "layoutStructure": "Detailed description of component hierarchy - mention which components contain which (e.g., 'Panel containing TextField and Button')",
  "generatedCode": "Complete React/TypeScript code with proper nesting structure",
  "confidence": 0.85,
  "reasoning": "Explain component choices AND nesting decisions"
}`;
  }

  /**
   * Analyze an image using GPT-4 Vision
   */
  async analyzeImage(
    imageBase64: string,
    onProgress?: ProgressCallback
  ): Promise<AIAnalysisResult> {
    if (!this.isConfigured || !this.client) {
      throw new Error('AI Service not configured. Please set OPENAI_API_KEY in environment variables.');
    }

    try {
      if (onProgress) onProgress('Preparing component library documentation...');
      const componentDocs = this.generatePrompt();

      if (onProgress) onProgress('Sending to OpenAI (this may take 10-30 seconds)...');
      
      console.log('[AI Service] Sending request to GPT-4o with vision...');
      console.log('[AI Service] Image size:', Math.round(imageBase64.length / 1024), 'KB');
      
      const startTime = Date.now();
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: componentDocs
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      });

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[AI Service] Received response in ${duration}s`);
      
      if (onProgress) onProgress('Parsing AI response...');
      
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        console.error('[AI Service] No content in response:', response);
        throw new Error('No response from OpenAI');
      }

      console.log('[AI Service] Response length:', content.length, 'chars');
      
      // Parse JSON response
      let jsonText = content.trim();
      
      // Handle markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      const result: AIAnalysisResult = JSON.parse(jsonText);

      logSocketSuccess('AI analysis complete', {
        components: result.detectedComponents,
        confidence: result.confidence,
        tokensUsed: response.usage?.total_tokens
      });

      if (onProgress) onProgress('Analysis complete!');
      
      return result;

    } catch (error) {
      console.error('[AI Service] Error during analysis:', error);
      
      if (error instanceof Error) {
        // Provide more specific error messages
        if (error.message.includes('API key')) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        }
        if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
          throw new Error('OpenAI API request timed out. Please try again.');
        }
        if (error.message.includes('rate_limit')) {
          throw new Error('OpenAI rate limit exceeded. Please wait a moment and try again.');
        }
      }
      
      logSocketError(error, { operation: 'analyzeImage' });
      throw error;
    }
  }

  /**
   * Validate that an image is appropriate for analysis
   */
  validateImage(imageBase64: string): { valid: boolean; error?: string } {
    if (!imageBase64 || imageBase64.length === 0) {
      return { valid: false, error: 'No image data provided' };
    }

    // Check size (rough estimate: 1 char base64 ≈ 0.75 bytes)
    const sizeInBytes = (imageBase64.length * 0.75);
    const sizeInMB = sizeInBytes / (1024 * 1024);

    if (sizeInMB > 20) {
      return { valid: false, error: 'Image too large (max 20MB)' };
    }

    return { valid: true };
  }

  /**
   * Get analysis cost estimate (approximate)
   */
  getEstimatedCost(imageBase64: string): { estimatedCostUSD: number; note: string } {
    const sizeInBytes = (imageBase64.length * 0.75);
    const sizeInMB = sizeInBytes / (1024 * 1024);

    // Rough estimate: GPT-4 Vision costs about $0.01-0.05 per image depending on detail level
    const estimatedCost = Math.max(0.01, Math.min(0.05, sizeInMB * 0.02));

    return {
      estimatedCostUSD: Number(estimatedCost.toFixed(3)),
      note: 'Estimate based on image size and GPT-4 Vision pricing'
    };
  }
}

