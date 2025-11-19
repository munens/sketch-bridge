import { useState, useEffect } from "react";
import { ComponentSuggestion } from "@sketch-bridge/common/model";
import { useCanvas } from "../../context";
import { shapeRecognizer } from "../../services";

const ComponentSuggestionPanel = () => {
  const { objects, selectedObjectId } = useCanvas();
  const [suggestions, setSuggestions] = useState<ComponentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<ComponentSuggestion | null>(null);

  useEffect(() => {
    if (selectedObjectId) {
      const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

      if (selectedObject) {
        console.log("[Component Suggestion] Analyzing object:", selectedObject);
        const recognized = shapeRecognizer.recognizeShape(selectedObject);
        console.log("[Component Suggestion] Found suggestions:", recognized);
        setSuggestions(recognized);

        if (recognized.length > 0) {
          setSelectedSuggestion(recognized[0]);
        } else {
          setSelectedSuggestion(null);
        }
      }
    } else {
      setSuggestions([]);
      setSelectedSuggestion(null);
    }
  }, [selectedObjectId, objects]);

  if (!selectedObjectId || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute right-96 top-20 w-96 bg-white border border-black-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-token-primary to-token-primary-dark text-white px-4 py-3">
        <h3 className="font-semibold text-lg">Component Suggestions</h3>
        <p className="text-xs text-white/80 mt-1">
          AI-detected component matches
        </p>
      </div>

      <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion, index) => (
          <div
            className={`p-3 border rounded-lg cursor-pointer transition-all ${
              selectedSuggestion?.componentId === suggestion.componentId
                ? "border-token-primary bg-blue-50"
                : "border-black-300 hover:border-token-primary hover:bg-black-50"
            }`}
            key={suggestion.componentId}
            onClick={() => setSelectedSuggestion(suggestion)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    suggestion.confidence > 0.8
                      ? "bg-green-500"
                      : suggestion.confidence > 0.6
                        ? "bg-yellow-500"
                        : "bg-orange-500"
                  }`}
                />
                <span className="font-semibold text-black-900">
                  {suggestion.componentName}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-black-600">
                  {Math.round(suggestion.confidence * 100)}%
                </span>
                {index === 0 ? (
                  <span className="px-2 py-0.5 bg-token-primary text-white text-xs rounded-full">
                    Best Match
                  </span>
                ) : null}
              </div>
            </div>

            {suggestion.reasoning ? (
              <p className="text-xs text-black-600 mb-2">
                {suggestion.reasoning}
              </p>
            ) : null}

            {suggestion.suggestedProps ? (
              <div className="bg-black-100 rounded p-2 mt-2">
                <p className="text-xs font-medium text-black-700 mb-1">
                  Suggested Props:
                </p>
                <div className="space-y-1">
                  {Object.entries(suggestion.suggestedProps)
                    .filter(([key]) => !["width", "height"].includes(key))
                    .slice(0, 3)
                    .map(([key, value]) => (
                      <div
                        className="flex items-center gap-2 text-xs"
                        key={key}
                      >
                        <span className="font-mono text-token-primary">
                          {key}:
                        </span>
                        <span className="text-black-700 truncate">
                          {typeof value === "string"
                            ? `"${value}"`
                            : String(value)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {selectedSuggestion ? (
        <div className="border-t border-black-300 bg-black-50 p-4">
          <button
            className="w-full px-4 py-2 bg-token-primary hover:bg-token-primary-dark text-white rounded-lg font-medium transition-colors"
            onClick={() => {
              console.log("Apply component mapping:", selectedSuggestion);
            }}
            type="button"
          >
            Apply Component Mapping
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ComponentSuggestionPanel;
