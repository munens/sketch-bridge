/**
 * AI Analysis result
 */
export interface AIAnalysisResult {
  detectedComponents: string[];
  layoutStructure: string;
  generatedCode: string;
  confidence: number;
  reasoning: string;
}

/**
 * AI Analysis request
 */
export interface AIAnalysisRequest {
  imageBase64: string;
  canvasId?: string;
  userId?: string;
}

