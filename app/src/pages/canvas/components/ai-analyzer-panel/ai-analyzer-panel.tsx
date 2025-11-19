import { useState, useRef, useEffect } from "react";
import { Socket } from "socket.io-client";
import { Button } from "../../../../components";
import { AIAnalysisResult } from "@sketch-bridge/common/model";

interface AIAnalyzerPanelProps {
  socket: Socket | null;
}

/**
 * AI-Powered Component Analyzer Panel
 * Uses socket events to analyze images on the backend with OpenAI GPT-4o Vision
 */
const AIAnalyzerPanel = ({ socket }: AIAnalyzerPanelProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Listen for AI analysis events
  useEffect(() => {
    if (!socket) return;

    socket.on("ai_progress", (data: { status: string }) => {
      console.log("[AI Analyzer] Progress:", data.status);
      setProgressStatus(data.status);
    });

    socket.on("ai_result", (data: AIAnalysisResult) => {
      console.log("[AI Analyzer] Result received:", data);
      setResult(data);
      setAnalyzing(false);
      setProgressStatus("");
    });

    socket.on("ai_error", (data: { error: string }) => {
      console.error("[AI Analyzer] Error:", data.error);
      setError(data.error);
      setAnalyzing(false);
      setProgressStatus("");
    });

    return () => {
      socket.off("ai_progress");
      socket.off("ai_result");
      socket.off("ai_error");
    };
  }, [socket]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Show preview
    const previewReader = new FileReader();
    previewReader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    previewReader.readAsDataURL(file);

    // Read file as base64 for analysis
    const analysisReader = new FileReader();
    analysisReader.onload = () => {
      const dataUrl = analysisReader.result as string;
      // Remove data URL prefix to get just base64
      const base64Data = dataUrl.split(",")[1];

      setAnalyzing(true);
      setError(null);
      setResult(null);
      setProgressStatus("Uploading image...");

      console.log("[AI Analyzer Panel] Emitting ai_analyze event");
      socket?.emit("ai_analyze", { imageBase64: base64Data });
    };

    analysisReader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    setResult(null);
    setError(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="absolute left-4 top-20 w-96 bg-white border border-black-300 rounded-lg shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-3">
        <h3 className="font-semibold text-lg">🤖 AI Component Analyzer</h3>
        <p className="text-xs text-white/80 mt-1">
          Upload UI screenshot for analysis
        </p>
      </div>

      <div className="p-4">
        {/* File Input (hidden) */}
        <input
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
          ref={fileInputRef}
          type="file"
        />

        {/* Upload Button */}
        {!previewImage ? (
          <div className="border-2 border-dashed border-black-300 rounded-lg p-8 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-black-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <Button.Primary
              onClick={handleUploadClick}
              text="Upload Screenshot"
            />
            <p className="text-xs text-black-600 mt-2">PNG, JPG up to 10MB</p>
          </div>
        ) : null}

        {/* Preview Image */}
        {previewImage ? (
          <div className="mb-4">
            <img
              alt="Preview"
              className="w-full rounded-lg border border-black-300"
              src={previewImage}
            />
          </div>
        ) : null}

        {/* Analyzing State */}
        {analyzing ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Analyzing with AI...
                </p>
                <p className="text-xs text-blue-700">
                  {progressStatus || "Processing..."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Error State */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-xs text-red-700 mt-1">{error}</p>
          </div>
        ) : null}

        {/* Results */}
        {result ? (
          <div className="space-y-4">
            {/* Detected Components */}
            <div>
              <h4 className="font-semibold text-black-900 mb-2">
                Detected Components:
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.detectedComponents.map((compId) => (
                  <span
                    className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                    key={compId}
                  >
                    {compId}
                  </span>
                ))}
              </div>
            </div>

            {/* Confidence */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-black-900">Confidence:</h4>
                <span className="text-sm font-bold text-purple-600">
                  {Math.round(result.confidence * 100)}%
                </span>
              </div>
              <div className="h-2 bg-black-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
            </div>

            {/* Layout Structure */}
            <div>
              <h4 className="font-semibold text-black-900 mb-2">
                Layout Structure:
              </h4>
              <p className="text-sm text-black-700 bg-black-50 rounded p-3">
                {result.layoutStructure}
              </p>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="font-semibold text-black-900 mb-2">
                AI Reasoning:
              </h4>
              <p className="text-sm text-black-700 bg-black-50 rounded p-3">
                {result.reasoning}
              </p>
            </div>

            {/* Generated Code */}
            <div>
              <h4 className="font-semibold text-black-900 mb-2">
                Generated Code:
              </h4>
              <div className="bg-black-900 text-green-400 rounded-lg p-4 overflow-x-auto">
                <pre className="text-xs font-mono whitespace-pre-wrap">
                  {result.generatedCode}
                </pre>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button.Primary
                onClick={() => {
                  navigator.clipboard.writeText(result.generatedCode);
                  // Could add a toast notification here
                }}
                text="Copy Code"
              />
              <Button.Secondary onClick={handleClear} text="Analyze Another" />
            </div>
          </div>
        ) : null}

        {/* Instructions when no result */}
        {!analyzing && !result && !error && !previewImage ? (
          <div className="mt-4 text-xs text-black-600 space-y-2">
            <p className="font-semibold">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Take a screenshot of any UI that uses your components</li>
              <li>Upload the image above</li>
              <li>AI analyzes the image using your component library</li>
              <li>Get detected components + generated code</li>
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AIAnalyzerPanel;
