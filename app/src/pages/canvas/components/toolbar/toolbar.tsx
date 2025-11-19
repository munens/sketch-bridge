import { useCanvas } from "../../context";
import { ToolType, CanvasObject } from "../../types";

const designTokenColors = [
  { name: "Primary", value: "#3B82F6" },
  { name: "Primary Dark", value: "#1D4ED8" },
  { name: "Success", value: "#10B981" },
  { name: "Warning", value: "#F59E0B" },
  { name: "Error", value: "#EF4444" },
  { name: "Gray 300", value: "#dee2e6" },
  { name: "Gray 600", value: "#6c757d" },
  { name: "Gray 900", value: "#212529" },
];

const Toolbar = () => {
  const { tool, setTool, clearCanvas, addObject, objects } = useCanvas();

  const handleToolChange = (type: ToolType) => {
    setTool({ ...tool, type });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const imageData = e.target?.result as string;

        // Get max zIndex from existing objects
        const maxZIndex = objects.length > 0
          ? Math.max(...objects.map((obj) => obj.zIndex))
          : 0;

        // Create image object with all required fields (matching other objects)
        const newObject: CanvasObject = {
          id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          canvasId: "default-canvas",
          type: "image" as const,
          x: 100,
          y: 100,
          width: 300,
          height: 300,
          rotation: 0,
          fillColor: "transparent",
          strokeColor: "#000000",
          strokeWidth: 0,
          opacity: 1,
          imageData,
          zIndex: maxZIndex + 1,
          createdBy: "local",
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        console.log("[Toolbar] Adding image object:", newObject.id);
        console.log("[Toolbar] Object details:", {
          id: newObject.id,
          type: newObject.type,
          canvasId: newObject.canvasId,
          createdBy: newObject.createdBy,
          hasImageData: !!imageData,
          imageDataLength: imageData?.length || 0
        });
        addObject(newObject);
      };
    reader.readAsDataURL(file);

    // Reset input
    event.target.value = "";
  };

  const handleColorChange = (color: string, type: "fill" | "stroke") => {
    setTool({
      ...tool,
      options: {
        ...tool.options,
        [type === "fill" ? "fillColor" : "strokeColor"]: color,
      },
    });
  };

  const handleStrokeWidthChange = (width: number) => {
    setTool({
      ...tool,
      options: {
        ...tool.options,
        strokeWidth: width,
      },
    });
  };

  const toolButton = (type: ToolType, icon: string, label: string) => (
    <button
      className={`p-3 rounded transition-colors ${
        tool.type === type
          ? "bg-token-primary text-white"
          : "bg-black-200 hover:bg-black-300"
      }`}
      onClick={() => handleToolChange(type)}
      title={label}
      type="button"
    >
      <span className="text-xl">{icon}</span>
    </button>
  );

  return (
    <div className="w-full bg-white border-b border-black-300 p-4">
      <div className="flex items-center gap-6">
        <div className="flex gap-2">
          {toolButton("select", "⌖", "Select")}
          {toolButton("rect", "▭", "Rectangle")}
          {toolButton("circle", "◯", "Circle")}
          {toolButton("path", "✎", "Draw")}
          {toolButton("pan", "✋", "Pan")}

          {/* Image Upload Button */}
          <label
            className="p-3 rounded transition-colors bg-black-200 hover:bg-black-300 cursor-pointer"
            title="Upload Image"
          >
            <span className="text-xl">🖼️</span>
            <input
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
              type="file"
            />
          </label>
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Fill Color</div>
          <div className="flex gap-1">
            {designTokenColors.map((color) => (
              <button
                className={`w-6 h-6 rounded border-2 transition-all ${
                  tool.options.fillColor === color.value
                    ? "border-black-900 scale-110"
                    : "border-black-300"
                }`}
                key={color.value}
                onClick={() => handleColorChange(color.value, "fill")}
                style={{ backgroundColor: color.value }}
                title={color.name}
                type="button"
              />
            ))}
            <button
              className={`w-6 h-6 rounded border-2 transition-all ${
                tool.options.fillColor === "transparent"
                  ? "border-black-900 scale-110"
                  : "border-black-300"
              }`}
              onClick={() => handleColorChange("transparent", "fill")}
              style={{
                background:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 4px 4px",
              }}
              title="Transparent"
              type="button"
            />
          </div>
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Stroke Color</div>
          <div className="flex gap-1">
            {designTokenColors.map((color) => (
              <button
                className={`w-6 h-6 rounded border-2 transition-all ${
                  tool.options.strokeColor === color.value
                    ? "border-black-900 scale-110"
                    : "border-black-300"
                }`}
                key={color.value}
                onClick={() => handleColorChange(color.value, "stroke")}
                style={{ backgroundColor: color.value }}
                title={color.name}
                type="button"
              />
            ))}
          </div>
        </div>

        <div className="h-8 w-px bg-black-300" />

        <div className="flex flex-col gap-2">
          <div className="text-xs text-black-600 font-medium">Stroke Width</div>
          <div className="flex gap-1">
            {[1, 2, 4, 8].map((width) => (
              <button
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  tool.options.strokeWidth === width
                    ? "bg-token-primary text-white"
                    : "bg-black-200 hover:bg-black-300"
                }`}
                key={width}
                onClick={() => handleStrokeWidthChange(width)}
                type="button"
              >
                {width}px
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        <button
          className="px-4 py-2 bg-token-error text-white rounded hover:bg-red-600 transition-colors"
          onClick={clearCanvas}
          type="button"
        >
          Clear Canvas
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
