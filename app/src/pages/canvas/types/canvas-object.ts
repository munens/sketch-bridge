export {
  Point,
  CanvasObject,
  Canvas,
  Session,
} from "@sketch-bridge/common/model";

export interface DrawingState {
  isDrawing: boolean;
  startPoint: Point | null;
  currentPoint: Point | null;
  currentPath: Point[];
}
