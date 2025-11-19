import { useState, useCallback } from "react";
import { Point, CanvasObject, DrawingState } from "../types";
import { useCanvas } from "../context";

const generateId = () =>
  `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const simplifyPath = (points: Point[], tolerance = 2): Point[] => {
  if (points.length < 3) return points;

  const getDistance = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPerpendicularDistance = (
    point: Point,
    lineStart: Point,
    lineEnd: Point,
  ) => {
    const dx = lineEnd.x - lineStart.x;
    const dy = lineEnd.y - lineStart.y;
    const mag = Math.sqrt(dx * dx + dy * dy);
    if (mag === 0) return getDistance(point, lineStart);
    const u =
      ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) /
      (mag * mag);
    const closest = {
      x: lineStart.x + u * dx,
      y: lineStart.y + u * dy,
    };
    return getDistance(point, closest);
  };

  const rdp = (points: Point[], start: number, end: number): Point[] => {
    if (end - start < 2) return [points[start], points[end]];

    let maxDist = 0;
    let maxIndex = start;

    for (let i = start + 1; i < end; i++) {
      const dist = getPerpendicularDistance(
        points[i],
        points[start],
        points[end],
      );
      if (dist > maxDist) {
        maxDist = dist;
        maxIndex = i;
      }
    }

    if (maxDist > tolerance) {
      const left = rdp(points, start, maxIndex);
      const right = rdp(points, maxIndex, end);
      return [...left.slice(0, -1), ...right];
    }

    return [points[start], points[end]];
  };

  return rdp(points, 0, points.length - 1);
};

const pathToSVG = (points: Point[]): string => {
  if (points.length === 0) return "";
  const [first, ...rest] = points;
  let path = `M ${first.x} ${first.y}`;
  rest.forEach((point) => {
    path += ` L ${point.x} ${point.y}`;
  });
  return path;
};

export const useDrawingTool = () => {
  const { tool, addObject, objects } = useCanvas();
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    startPoint: null,
    currentPoint: null,
    currentPath: [],
  });

  const startDrawing = useCallback(
    (point: Point) => {
      if (tool.type === "select" || tool.type === "pan") return;

      setDrawingState({
        isDrawing: true,
        startPoint: point,
        currentPoint: point,
        currentPath: tool.type === "path" ? [point] : [],
      });
    },
    [tool.type],
  );

  const updateDrawing = useCallback(
    (point: Point) => {
      if (!drawingState.isDrawing) return;

      if (tool.type === "path") {
        setDrawingState((prev) => ({
          ...prev,
          currentPoint: point,
          currentPath: [...prev.currentPath, point],
        }));
      } else {
        setDrawingState((prev) => ({
          ...prev,
          currentPoint: point,
        }));
      }
    },
    [drawingState.isDrawing, tool.type],
  );

  const endDrawing = useCallback(() => {
    if (!drawingState.isDrawing || !drawingState.startPoint) {
      setDrawingState({
        isDrawing: false,
        startPoint: null,
        currentPoint: null,
        currentPath: [],
      });
      return;
    }

    const { startPoint, currentPoint, currentPath } = drawingState;
    const maxZIndex = objects.reduce(
      (max, obj) => Math.max(max, obj.zIndex),
      0,
    );

    let newObject: CanvasObject | null = null;

    if (tool.type === "rect" && currentPoint) {
      const x = Math.min(startPoint.x, currentPoint.x);
      const y = Math.min(startPoint.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);

      if (width > 5 && height > 5) {
        newObject = {
          id: generateId(),
          canvasId: "default-canvas",
          type: "rect",
          x,
          y,
          width,
          height,
          rotation: 0,
          fillColor: tool.options.fillColor,
          strokeColor: tool.options.strokeColor,
          strokeWidth: tool.options.strokeWidth,
          opacity: 1,
          zIndex: maxZIndex + 1,
          createdBy: "local",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }
    } else if (tool.type === "circle" && currentPoint) {
      const centerX = (startPoint.x + currentPoint.x) / 2;
      const centerY = (startPoint.y + currentPoint.y) / 2;
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);

      if (width > 5 && height > 5) {
        newObject = {
          id: generateId(),
          canvasId: "default-canvas",
          type: "circle",
          x: centerX - width / 2,
          y: centerY - height / 2,
          width,
          height,
          rotation: 0,
          fillColor: tool.options.fillColor,
          strokeColor: tool.options.strokeColor,
          strokeWidth: tool.options.strokeWidth,
          opacity: 1,
          zIndex: maxZIndex + 1,
          createdBy: "local",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
      }
    } else if (tool.type === "path" && currentPath.length > 2) {
      const simplified = simplifyPath(currentPath);
      const pathData = pathToSVG(simplified);

      const minX = Math.min(...simplified.map((p) => p.x));
      const minY = Math.min(...simplified.map((p) => p.y));
      const maxX = Math.max(...simplified.map((p) => p.x));
      const maxY = Math.max(...simplified.map((p) => p.y));

      newObject = {
        id: generateId(),
        canvasId: "default-canvas",
        type: "path",
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
        rotation: 0,
        fillColor: "transparent",
        strokeColor: tool.options.strokeColor,
        strokeWidth: tool.options.strokeWidth,
        opacity: 1,
        pathData,
        zIndex: maxZIndex + 1,
        createdBy: "local",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    if (newObject) {
      addObject(newObject);
    }

    setDrawingState({
      isDrawing: false,
      startPoint: null,
      currentPoint: null,
      currentPath: [],
    });
  }, [drawingState, tool, addObject, objects]);

  return {
    drawingState,
    startDrawing,
    updateDrawing,
    endDrawing,
  };
};
