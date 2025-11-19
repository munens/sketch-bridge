import { useState, useEffect } from "react";
import { ComponentSuggestion } from "@sketch-bridge/common/model";
import { useCanvas } from "../../context";
import { shapeRecognizer } from "../../services";
import { Button, TextField, Panel } from "../../../../components";

const ComponentPreviewPanel = () => {
  const { objects, selectedObjectId } = useCanvas();
  const [suggestion, setSuggestion] = useState<ComponentSuggestion | null>(
    null,
  );

  useEffect(() => {
    if (selectedObjectId) {
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

      if (selectedObject) {
        console.log("[Component Preview] Analyzing object:", selectedObject);
        const suggestions = shapeRecognizer.recognizeShape(selectedObject);
        console.log("[Component Preview] Suggestions:", suggestions);
        if (suggestions.length > 0) {
          setSuggestion(suggestions[0]);
        } else {
          setSuggestion(null);
        }
      }
    } else {
      setSuggestion(null);
    }
  }, [selectedObjectId, objects]);

  if (!suggestion || suggestion.confidence < 0.6) {
    return null;
  }

  const renderPreview = () => {
    const props = suggestion.suggestedProps || {};

    switch (suggestion.componentId) {
      case "button-primary":
        return (
          <Button.Primary
            disabled={props.disabled || false}
            onClick={() => {}}
            text={props.text || "Button"}
          />
        );

      case "button-secondary":
        return (
          <Button.Secondary
            disabled={props.disabled || false}
            onClick={() => {}}
            text={props.text || "Button"}
          />
        );

      case "text-field":
        return (
          <TextField
            label={props.label}
            placeholder={props.placeholder || "Enter text..."}
            type={props.type || "text"}
            value=""
          />
        );

      case "panel":
        return (
          <Panel backgroundColor={props.backgroundColor || "bg-white"}>
            <div className="p-4 text-black-900">Panel Content</div>
          </Panel>
        );

      default:
        return (
          <div className="text-black-600 text-sm">Preview not available</div>
        );
    }
  };

  return (
    <div className="absolute right-96 bottom-4 w-96 bg-white border border-black-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">Live Component Preview</h3>
        <p className="text-xs text-white/80 mt-1">{suggestion.componentName}</p>
      </div>

      <div className="p-6 bg-black-50">
        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-black-300">
          {renderPreview()}
        </div>
      </div>

      <div className="px-4 py-3 bg-black-100 border-t border-black-300">
        <div className="flex items-center justify-between text-xs">
          <span className="text-black-600">Confidence</span>
          <span className="font-semibold text-token-primary">
            {Math.round(suggestion.confidence * 100)}%
          </span>
        </div>
        <div className="mt-2 h-2 bg-black-300 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-token-primary to-green-500 transition-all"
            style={{ width: `${suggestion.confidence * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ComponentPreviewPanel;
