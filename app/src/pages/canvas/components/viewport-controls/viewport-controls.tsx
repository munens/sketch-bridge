import { useViewport } from "../../hooks";

const ViewportControls = () => {
  const { viewport, zoom, resetView } = useViewport();

  const handleZoomIn = () => {
    zoom(0.2, { x: 400, y: 300 });
  };

  const handleZoomOut = () => {
    zoom(-0.2, { x: 400, y: 300 });
  };

  return (
    <div className="absolute bottom-4 right-4 bg-white border border-black-300 rounded-lg shadow-lg p-3 flex items-center gap-3">
      <button
        className="w-8 h-8 flex items-center justify-center bg-black-200 hover:bg-black-300 rounded transition-colors"
        onClick={handleZoomOut}
        title="Zoom Out"
        type="button"
      >
        <span className="text-lg">−</span>
      </button>

      <div className="text-sm font-medium text-black-900 min-w-[60px] text-center">
        {Math.round(viewport.zoom * 100)}%
      </div>

      <button
        className="w-8 h-8 flex items-center justify-center bg-black-200 hover:bg-black-300 rounded transition-colors"
        onClick={handleZoomIn}
        title="Zoom In"
        type="button"
      >
        <span className="text-lg">+</span>
      </button>

      <div className="h-6 w-px bg-black-300" />

      <button
        className="px-3 py-1 bg-black-200 hover:bg-black-300 rounded text-sm transition-colors"
        onClick={resetView}
        title="Reset View"
        type="button"
      >
        Reset
      </button>
    </div>
  );
};

export default ViewportControls;
