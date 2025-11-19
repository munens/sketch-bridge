import { useRef, useEffect, useState } from 'react';
import { useCanvas } from '../../context';
import { useViewport, useDrawingTool } from '../../hooks';
import { Point } from '../../types';
import { throttle } from 'lodash';

interface CanvasRendererProps {
  onCursorMove?: (x: number, y: number) => void;
}

const CanvasRenderer = ({ onCursorMove }: CanvasRendererProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState<Point | null>(null);

  const { objects, tool, selectedObjectId, selectObject } = useCanvas();
  const { viewport, screenToWorld, pan, zoom } = useViewport();
  const { drawingState, startDrawing, updateDrawing, endDrawing } = useDrawingTool();

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridSize = 50 * viewport.zoom;
    const offsetX = (-viewport.x * viewport.zoom) % gridSize;
    const offsetY = (-viewport.y * viewport.zoom) % gridSize;

    for (let x = offsetX; x < dimensions.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, dimensions.height);
      ctx.stroke();
    }

    for (let y = offsetY; y < dimensions.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(dimensions.width, y);
      ctx.stroke();
    }

    if (drawingState.isDrawing && drawingState.startPoint && drawingState.currentPoint) {
      const start = drawingState.startPoint;
      const current = drawingState.currentPoint;

      ctx.strokeStyle = tool.options.strokeColor;
      ctx.fillStyle = tool.options.fillColor;
      ctx.lineWidth = tool.options.strokeWidth;
      ctx.globalAlpha = 0.7;

      if (tool.type === 'rect') {
        const x = Math.min(start.x, current.x);
        const y = Math.min(start.y, current.y);
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);

        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
      } else if (tool.type === 'circle') {
        const centerX = (start.x + current.x) / 2;
        const centerY = (start.y + current.y) / 2;
        const radiusX = Math.abs(current.x - start.x) / 2;
        const radiusY = Math.abs(current.y - start.y) / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (tool.type === 'path' && drawingState.currentPath.length > 1) {
        ctx.beginPath();
        const [first, ...rest] = drawingState.currentPath;
        ctx.moveTo(first.x, first.y);
        rest.forEach(point => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }, [dimensions, viewport, drawingState, tool]);

  const getMousePos = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const screenPos = getMousePos(e);

    if (tool.type === 'pan') {
      setIsPanning(true);
      setLastPanPoint(screenPos);
    } else if (tool.type === 'select') {
      selectObject(null);
    } else {
      const worldPos = screenToWorld(screenPos);
      startDrawing(worldPos);
    }
  };

  const throttledCursorMove = useRef(
    throttle((x: number, y: number) => {
      if (onCursorMove) {
        onCursorMove(x, y);
      }
    }, 50)
  ).current;

  const handleMouseMove = (e: React.MouseEvent) => {
    const screenPos = getMousePos(e);
    const worldPos = screenToWorld(screenPos);

    throttledCursorMove(worldPos.x, worldPos.y);

    if (isPanning && lastPanPoint && tool.type === 'pan') {
      const dx = screenPos.x - lastPanPoint.x;
      const dy = screenPos.y - lastPanPoint.y;
      pan(dx, dy);
      setLastPanPoint(screenPos);
    } else if (drawingState.isDrawing) {
      updateDrawing(worldPos);
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      setLastPanPoint(null);
    } else if (drawingState.isDrawing) {
      endDrawing();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const screenPos = getMousePos(e);
    const delta = -e.deltaY * 0.001;
    zoom(delta, screenPos);
  };

  const getCursor = () => {
    if (tool.type === 'pan') return isPanning ? 'cursor-grabbing' : 'cursor-grab';
    if (tool.type === 'select') return 'cursor-default';
    return 'cursor-crosshair';
  };

  return (
    <div ref={containerRef} className="relative w-full h-full bg-white overflow-hidden">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`absolute top-0 left-0 ${getCursor()}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={dimensions.width}
        height={dimensions.height}
      >
        <g transform={`translate(${-viewport.x * viewport.zoom}, ${-viewport.y * viewport.zoom}) scale(${viewport.zoom})`}>
          {objects.map(obj => {
            const isSelected = obj.id === selectedObjectId;
            
            if (obj.type === 'rect') {
              return (
                <g key={obj.id}>
                  <rect
                    x={obj.x}
                    y={obj.y}
                    width={obj.width}
                    height={obj.height}
                    fill={obj.fillColor}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth / viewport.zoom}
                    opacity={obj.opacity}
                  />
                  {isSelected && (
                    <rect
                      x={obj.x - 2}
                      y={obj.y - 2}
                      width={obj.width + 4}
                      height={obj.height + 4}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth={2 / viewport.zoom}
                      strokeDasharray="5,5"
                    />
                  )}
                </g>
              );
            }
            
            if (obj.type === 'circle') {
              const cx = obj.x + obj.width / 2;
              const cy = obj.y + obj.height / 2;
              const rx = obj.width / 2;
              const ry = obj.height / 2;
              
              return (
                <g key={obj.id}>
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={rx}
                    ry={ry}
                    fill={obj.fillColor}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth / viewport.zoom}
                    opacity={obj.opacity}
                  />
                  {isSelected && (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={rx + 2}
                      ry={ry + 2}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth={2 / viewport.zoom}
                      strokeDasharray="5,5"
                    />
                  )}
                </g>
              );
            }
            
            if (obj.type === 'path' && obj.pathData) {
              return (
                <g key={obj.id}>
                  <path
                    d={obj.pathData}
                    fill={obj.fillColor}
                    stroke={obj.strokeColor}
                    strokeWidth={obj.strokeWidth / viewport.zoom}
                    opacity={obj.opacity}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {isSelected && (
                    <rect
                      x={obj.x - 2}
                      y={obj.y - 2}
                      width={obj.width + 4}
                      height={obj.height + 4}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth={2 / viewport.zoom}
                      strokeDasharray="5,5"
                    />
                  )}
                </g>
              );
            }
            
            return null;
          })}
        </g>
      </svg>
    </div>
  );
};

export default CanvasRenderer;

