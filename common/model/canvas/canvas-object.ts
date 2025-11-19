export interface CanvasObject {
  id: string;
  canvasId: string;
  type: 'rect' | 'circle' | 'path' | 'text' | 'image';
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
  imageData?: string; // Base64 image data
  zIndex: number;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

