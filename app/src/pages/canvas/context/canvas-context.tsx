import { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import { CanvasObject, Tool, Viewport, Point } from '../types';

interface CanvasContextValue {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  tool: Tool;
  viewport: Viewport;
  addObject: (object: CanvasObject, skipEmit?: boolean) => void;
  updateObject: (id: string, updates: Partial<CanvasObject>, skipEmit?: boolean) => void;
  deleteObject: (id: string, skipEmit?: boolean) => void;
  selectObject: (id: string | null) => void;
  setTool: (tool: Tool) => void;
  setViewport: (viewport: Viewport) => void;
  clearCanvas: () => void;
  setObjects: (objects: CanvasObject[]) => void;
  setEmitCallbacks: (callbacks: EmitCallbacks) => void;
}

interface EmitCallbacks {
  onObjectAdd?: (object: CanvasObject) => void;
  onObjectUpdate?: (objectId: string, updates: Partial<CanvasObject>) => void;
  onObjectDelete?: (objectId: string) => void;
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

  const emitCallbacksRef = useRef<EmitCallbacks>({});

  const setEmitCallbacks = useCallback((callbacks: EmitCallbacks) => {
    emitCallbacksRef.current = callbacks;
  }, []);

  const addObject = useCallback((object: CanvasObject, skipEmit = false) => {
    setObjects(prev => [...prev, object]);
    if (!skipEmit && emitCallbacksRef.current.onObjectAdd) {
      emitCallbacksRef.current.onObjectAdd(object);
    }
  }, []);

  const updateObject = useCallback((id: string, updates: Partial<CanvasObject>, skipEmit = false) => {
    setObjects(prev =>
      prev.map(obj => (obj.id === id ? { ...obj, ...updates } : obj))
    );
    if (!skipEmit && emitCallbacksRef.current.onObjectUpdate) {
      emitCallbacksRef.current.onObjectUpdate(id, updates);
    }
  }, []);

  const deleteObject = useCallback((id: string, skipEmit = false) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    if (selectedObjectId === id) {
      setSelectedObjectId(null);
    }
    if (!skipEmit && emitCallbacksRef.current.onObjectDelete) {
      emitCallbacksRef.current.onObjectDelete(id);
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
    setObjects,
    setEmitCallbacks,
  };

  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
};

