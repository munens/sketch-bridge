import { useCanvas } from "../../context";

const PropertiesPanel = () => {
  const { objects, selectedObjectId, updateObject, deleteObject } = useCanvas();

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  if (!selectedObject) {
    return (
      <div className="w-80 bg-white border-l border-black-300 p-4">
        <div className="text-black-600 text-sm">
          Select an object to view properties
        </div>
      </div>
    );
  }

  const handleUpdate = (field: string, value: string | number) => {
    updateObject(selectedObject.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-black-300 p-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-black-900">Properties</h3>
        <button
          className="px-3 py-1 bg-token-error text-white text-sm rounded hover:bg-red-600 transition-colors"
          onClick={() => deleteObject(selectedObject.id)}
          type="button"
        >
          Delete
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-black-600 mb-1">
            Type
          </label>
          <div className="px-3 py-2 bg-black-100 rounded text-sm capitalize">
            {selectedObject.type}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-black-600 mb-1">
              X
            </label>
            <input
              className="w-full px-2 py-1 border border-black-300 rounded text-sm"
              onChange={(e) => handleUpdate("x", Number(e.target.value))}
              type="number"
              value={Math.round(selectedObject.x)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-black-600 mb-1">
              Y
            </label>
            <input
              className="w-full px-2 py-1 border border-black-300 rounded text-sm"
              onChange={(e) => handleUpdate("y", Number(e.target.value))}
              type="number"
              value={Math.round(selectedObject.y)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-black-600 mb-1">
              Width
            </label>
            <input
              className="w-full px-2 py-1 border border-black-300 rounded text-sm"
              onChange={(e) => handleUpdate("width", Number(e.target.value))}
              type="number"
              value={Math.round(selectedObject.width)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-black-600 mb-1">
              Height
            </label>
            <input
              className="w-full px-2 py-1 border border-black-300 rounded text-sm"
              onChange={(e) => handleUpdate("height", Number(e.target.value))}
              type="number"
              value={Math.round(selectedObject.height)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-black-600 mb-1">
            Fill Color
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-black-300"
              style={{ backgroundColor: selectedObject.fillColor }}
            />
            <input
              className="flex-1 px-2 py-1 border border-black-300 rounded text-sm font-mono"
              onChange={(e) => handleUpdate("fillColor", e.target.value)}
              type="text"
              value={selectedObject.fillColor}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-black-600 mb-1">
            Stroke Color
          </label>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded border border-black-300"
              style={{ backgroundColor: selectedObject.strokeColor }}
            />
            <input
              className="flex-1 px-2 py-1 border border-black-300 rounded text-sm font-mono"
              onChange={(e) => handleUpdate("strokeColor", e.target.value)}
              type="text"
              value={selectedObject.strokeColor}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-black-600 mb-1">
            Stroke Width
          </label>
          <input
            className="w-full px-2 py-1 border border-black-300 rounded text-sm"
            max="20"
            min="1"
            onChange={(e) =>
              handleUpdate("strokeWidth", Number(e.target.value))
            }
            type="number"
            value={selectedObject.strokeWidth}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-black-600 mb-1">
            Opacity
          </label>
          <input
            className="w-full"
            max="1"
            min="0"
            onChange={(e) => handleUpdate("opacity", Number(e.target.value))}
            step="0.1"
            type="range"
            value={selectedObject.opacity}
          />
          <div className="text-xs text-black-600 text-right">
            {Math.round(selectedObject.opacity * 100)}%
          </div>
        </div>

        <div className="pt-4 border-t border-black-300">
          <div className="text-xs font-medium text-black-600 mb-2">
            Design Tokens
          </div>
          <div className="bg-black-100 rounded p-3 space-y-1">
            <div className="text-xs">
              <span className="text-black-600">Fill:</span>{" "}
              <span className="font-mono text-black-900">
                {selectedObject.fillColor}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-black-600">Stroke:</span>{" "}
              <span className="font-mono text-black-900">
                {selectedObject.strokeColor}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-black-600">Width:</span>{" "}
              <span className="font-mono text-black-900">
                {selectedObject.strokeWidth}px
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesPanel;
