import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { CanvasObject, Tool, Viewport } from "../types";

interface CanvasContextValue {
  objects: CanvasObject[];
  selectedObjectId: string | null;
  tool: Tool;
  viewport: Viewport;
  addObject: (object: CanvasObject, skipEmit?: boolean) => void;
  updateObject: (
    id: string,
    updates: Partial<CanvasObject>,
    skipEmit?: boolean,
  ) => void;
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
  onClearCanvas?: () => void;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error("useCanvas must be used within CanvasProvider");
  }
  return context;
};

interface CanvasProviderProps {
  children: ReactNode;
}

export const CanvasProvider = ({ children }: CanvasProviderProps) => {
  const [objects, setObjects] = useState<CanvasObject[]>([]);
  
  // Debug: Track objects changes
  useEffect(() => {
    console.log('[Canvas Context] Objects array changed:', {
      count: objects.length,
      objectIds: objects.map(o => ({ id: o.id, type: o.type }))
    });
  }, [objects]);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [tool, setTool] = useState<Tool>({
    type: "rect",
    options: {
      fillColor: "#3B82F6",
      strokeColor: "#1D4ED8",
      strokeWidth: 2,
    },
  });

  const emitCallbacksRef = useRef<EmitCallbacks>({});

  const setEmitCallbacks = useCallback((callbacks: EmitCallbacks) => {
    emitCallbacksRef.current = callbacks;
  }, []);

  const addObject = useCallback((object: CanvasObject, skipEmit = false) => {
    console.log('[Canvas Context] Adding object:', object.id, 'skipEmit:', skipEmit);
    setObjects((prev) => {
      console.log('[Canvas Context] Previous objects count:', prev.length);
      const newObjects = [...prev, object];
      console.log('[Canvas Context] New objects count:', newObjects.length);
      return newObjects;
    });
    if (!skipEmit && emitCallbacksRef.current.onObjectAdd) {
      console.log('[Canvas Context] Emitting object add via callback');
      emitCallbacksRef.current.onObjectAdd(object);
    } else {
      console.log('[Canvas Context] Skipping emit or no callback');
    }
  }, []);

  const updateObject = useCallback(
    (id: string, updates: Partial<CanvasObject>, skipEmit = false) => {
      setObjects((prev) =>
        prev.map((obj) => (obj.id === id ? { ...obj, ...updates } : obj)),
      );
      if (!skipEmit && emitCallbacksRef.current.onObjectUpdate) {
        emitCallbacksRef.current.onObjectUpdate(id, updates);
      }
    },
    [],
  );

  const deleteObject = useCallback(
    (id: string, skipEmit = false) => {
      console.log('[Canvas Context] deleteObject called with id:', id, 'skipEmit:', skipEmit);
      setObjects((prev) => {
        console.log('[Canvas Context] Filtering objects - before:', prev.length);
        const filtered = prev.filter((obj) => obj.id !== id);
        console.log('[Canvas Context] Filtering objects - after:', filtered.length);
        return filtered;
      });
      if (selectedObjectId === id) {
        setSelectedObjectId(null);
      }
      if (!skipEmit && emitCallbacksRef.current.onObjectDelete) {
        console.log('[Canvas Context] Emitting object delete via callback');
        emitCallbacksRef.current.onObjectDelete(id);
      }
    },
    [selectedObjectId],
  );

  const selectObject = useCallback((id: string | null) => {
    console.log('[Canvas Context] selectObject called with id:', id);
    console.log('[Canvas Context] Current objects:', objects.length);
    setSelectedObjectId(id);
  }, [objects.length]);

  const clearCanvas = useCallback(() => {
    setObjects([]);
    setSelectedObjectId(null);

    if (emitCallbacksRef.current.onClearCanvas) {
      emitCallbacksRef.current.onClearCanvas();
    }
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

  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
};
