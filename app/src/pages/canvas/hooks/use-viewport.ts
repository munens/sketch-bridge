import { useCallback } from 'react';
import { Point, Viewport } from '../types';
import { useCanvas } from '../context';

export const useViewport = () => {
  const { viewport, setViewport } = useCanvas();

  const worldToScreen = useCallback(
    (worldPoint: Point): Point => {
      return {
        x: (worldPoint.x - viewport.x) * viewport.zoom,
        y: (worldPoint.y - viewport.y) * viewport.zoom,
      };
    },
    [viewport]
  );

  const screenToWorld = useCallback(
    (screenPoint: Point): Point => {
      return {
        x: screenPoint.x / viewport.zoom + viewport.x,
        y: screenPoint.y / viewport.zoom + viewport.y,
      };
    },
    [viewport]
  );

  const pan = useCallback(
    (deltaX: number, deltaY: number) => {
      setViewport({
        ...viewport,
        x: viewport.x - deltaX / viewport.zoom,
        y: viewport.y - deltaY / viewport.zoom,
      });
    },
    [viewport, setViewport]
  );

  const zoom = useCallback(
    (delta: number, centerPoint: Point) => {
      const worldCenter = screenToWorld(centerPoint);
      const newZoom = Math.max(0.1, Math.min(10, viewport.zoom * (1 + delta)));
      
      const newViewport: Viewport = {
        x: worldCenter.x - centerPoint.x / newZoom,
        y: worldCenter.y - centerPoint.y / newZoom,
        zoom: newZoom,
      };
      
      setViewport(newViewport);
    },
    [viewport, setViewport, screenToWorld]
  );

  const resetView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

  return {
    viewport,
    worldToScreen,
    screenToWorld,
    pan,
    zoom,
    resetView,
  };
};

