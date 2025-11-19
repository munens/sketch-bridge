export type ToolType = 'select' | 'rect' | 'circle' | 'path' | 'pan' | 'text';

export interface ToolOptions {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
}

export interface Tool {
  type: ToolType;
  options: ToolOptions;
}

