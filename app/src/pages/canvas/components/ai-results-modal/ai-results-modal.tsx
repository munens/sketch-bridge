import { Button } from "../../../../components";
import { AIAnalysisResult } from "@sketch-bridge/common/model";

interface AIResultsModalProps {
  result: AIAnalysisResult;
  onClose: () => void;
}

const ConfidenceSection = ({ confidence }: { confidence: number }) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <span>📊</span>
        Confidence Score
      </h3>
      <span className="text-2xl font-bold text-purple-600">
        {Math.round(confidence * 100)}%
      </span>
    </div>
    <div className="h-3 bg-black-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
        style={{ width: `${confidence * 100}%` }}
      />
    </div>
  </div>
);

const GeneratedCodeSection = ({
  code,
  onCopy,
}: {
  code: string;
  onCopy: () => void;
}) => (
  <div>
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <span>💻</span>
        Generated Code
      </h3>
      <button
        className="text-sm px-3 py-1 bg-black-200 hover:bg-black-300 rounded transition-colors"
        onClick={onCopy}
        type="button"
      >
        📋 Copy
      </button>
    </div>
    <div className="bg-black-900 text-green-400 rounded-lg p-4 overflow-x-auto">
      <pre className="text-sm font-mono whitespace-pre-wrap">{code}</pre>
    </div>
  </div>
);

const AIResultsModal = ({ result, onClose }: AIResultsModalProps) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(result.generatedCode);
    // Could add toast notification
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">🤖 AI Analysis Results</h2>
            <p className="text-sm text-white/80 mt-1">
              Component detection and code generation
            </p>
          </div>
          <button
            className="text-white/80 hover:text-white text-2xl font-bold leading-none"
            onClick={onClose}
            type="button"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Detected Components */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span>📦</span>
              Detected Components
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.detectedComponents.map((compId) => (
                <span
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-medium text-sm"
                  key={compId}
                >
                  {compId}
                </span>
              ))}
            </div>
          </div>

          {/* Confidence */}
          <ConfidenceSection confidence={result.confidence} />

          {/* Layout Structure */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span>🏗️</span>
              Layout Structure
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-black-800">{result.layoutStructure}</p>
            </div>
          </div>

          {/* AI Reasoning */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <span>💡</span>
              AI Reasoning
            </h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-black-800 text-sm leading-relaxed">
                {result.reasoning}
              </p>
            </div>
          </div>

          {/* Generated Code */}
          <GeneratedCodeSection
            code={result.generatedCode}
            onCopy={handleCopyCode}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-black-300 bg-black-50 px-6 py-4 flex justify-end gap-3">
          <Button.Secondary onClick={onClose} text="Close" />
          <Button.Primary
            onClick={() => {
              handleCopyCode();
              onClose();
            }}
            text="Copy Code"
          />
        </div>
      </div>
    </div>
  );
};

export default AIResultsModal;
