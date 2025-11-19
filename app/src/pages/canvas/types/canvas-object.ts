export interface Point {
  x: number;
  y: number;
}

export interface CanvasObject {
  id: string;
  type: 'rect' | 'circle' | 'path' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  pathData?: string;
  textContent?: string;
  fontSize?: number;
  zIndex: number;
  createdAt: number;
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  currentPath: Point[];
}

