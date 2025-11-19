import { useViewport } from '../../hooks';

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
        onClick={handleZoomOut}
        className="w-8 h-8 flex items-center justify-center bg-black-200 hover:bg-black-300 rounded transition-colors"
        title="Zoom Out"
      >
        <span className="text-lg">−</span>
      </button>
      
      <div className="text-sm font-medium text-black-900 min-w-[60px] text-center">
        {Math.round(viewport.zoom * 100)}%
      </div>
      
      <button
        onClick={handleZoomIn}
        className="w-8 h-8 flex items-center justify-center bg-black-200 hover:bg-black-300 rounded transition-colors"
        title="Zoom In"
      >
        <span className="text-lg">+</span>
      </button>
      
      <div className="h-6 w-px bg-black-300" />
      
      <button
        onClick={resetView}
        className="px-3 py-1 bg-black-200 hover:bg-black-300 rounded text-sm transition-colors"
        title="Reset View"
      >
        Reset
      </button>
    </div>
  );
};

export default ViewportControls;

