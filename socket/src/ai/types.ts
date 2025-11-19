import type { ComponentMetadata, AIAnalysisResult, AIAnalysisRequest } from '../../../common/model';

// Re-export common types
export type { AIAnalysisResult, AIAnalysisRequest };

/**
 * Extended component metadata for AI analysis
 */
export interface ComponentKnowledge extends ComponentMetadata {
  visualDescription: string;
  sourceCode: string;
  usageExamples: CodeExample[];
  visualCharacteristics: {
    colors: string[];
    typography: string[];
    spacing: string[];
    borders: string[];
  };
}

export interface CodeExample {
  description: string;
  code: string;
}

/**
 * AI Analysis progress callback
 */
export type ProgressCallback = (status: string) => void;

