export interface CanvasObject {
  id: string;
  canvasId: string;
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
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

