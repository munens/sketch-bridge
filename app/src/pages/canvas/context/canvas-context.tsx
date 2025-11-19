import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { CanvasObject, Tool, Viewport, Point } from '../types';

interface CanvasContextValue {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  tool: Tool;
  viewport: Viewport;
  addObject: (object: CanvasObject) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>) => void;
  deleteObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  setTool: (tool: Tool) => void;
  setViewport: (viewport: Viewport) => void;
  clearCanvas: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within CanvasProvider');
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider = ({ children }: CanvasProviderProps) => {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<Tool>({
    type: 'rect',
    options: {
      fillColor: '#3B82F6',
      strokeColor: '#1D4ED8',
      strokeWidth: 2,
    },
  });

  const addObject = useCallback((object: CanvasObject) => {
    setObjects(prev => [...prev, object]);
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, ...updates } : obj))
    );
  }, []);

  const deleteObject = useCallback((id: string) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
  }, [selectedObjectId]);

  const selectObject = useCallback((id: string | null) => {
    setSelectedObjectId(id);
  }, []);

  const clearCanvas = useCallback(() => {
    setObjects([]);
    setSelectedObjectId(null);
  }, []);

  const value: CanvasContextValue = {
    objects,
    selectedObjectId,
    tool,
    viewport,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setTool,
    setViewport,
    clearCanvas,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

