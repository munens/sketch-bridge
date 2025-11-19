export interface ComponentMetadata {
  id: string;
  name: string;
  category: 'button' | 'input' | 'card' | 'container' | 'text' | 'layout';
  description: string;
  props: ComponentProp[];
  defaultProps?: Record<string, any>;
  variants?: string[];
  matchingPatterns: ShapePattern[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface ShapePattern {
  shapeType: 'rect' | 'circle' | 'path' | 'text' | 'group';
  aspectRatioMin?: number;
  aspectRatioMax?: number;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  hasText?: boolean;
  hasIcon?: boolean;
  confidence: number;
}

export interface ComponentSuggestion {
  componentId: string;
  componentName: string;
  confidence: number;
  matchedPattern: ShapePattern;
  suggestedProps?: Record<string, any>;
  reasoning?: string;
}

export interface ComponentMapping {
  id: string;
  objectId: string;
  componentId: string;
  componentName: string;
  props: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

