import { useState } from "react";
import { CanvasProvider } from "./context";
import {
  CanvasRenderer,
  Toolbar,
  PropertiesPanel,
  ViewportControls,
  RemoteCursors,
  ConnectionStatus,
  ComponentSuggestionPanel,
  ComponentPreviewPanel,
} from "./components";
import { AIResultsModal } from "./components/ai-results-modal";
import { useSocket } from "./hooks";
import { AIAnalysisResult } from "@sketch-bridge/common/model";

const generateId = () =>
  `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const CanvasContent = () => {
  const canvasId = "default-canvas";
  const [userId] = useState(() => {
    const stored = localStorage.getItem("sketch-bridge-user-id");
    if (stored) return stored;
    const newId = generateId();
    localStorage.setItem("sketch-bridge-user-id", newId);
    return newId;
  });
  const [userName] = useState(() => {
    const stored = localStorage.getItem("sketch-bridge-user-name");
    if (stored) return stored;
    const newName = `User ${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem("sketch-bridge-user-name", newName);
    return newName;
  });
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const { socket, isConnected, remoteSessions, emitCursorMove } = useSocket(
    canvasId,
    userId,
    userName,
  );

  const handleImageAnalyze = (imageData: string) => {
    if (!socket) return;

    setAnalyzing(true);

    // Remove data URL prefix to get base64
    const base64Data = imageData.split(",")[1] || imageData;

    console.log("[Canvas] Emitting AI analyze for image");
    socket.emit("ai_analyze", { imageBase64: base64Data });

    // Listen for result
    socket.once("ai_result", (result: AIAnalysisResult) => {
      console.log("[Canvas] AI result received:", result);
      setAiResult(result);
      setAnalyzing(false);
    });

    socket.once("ai_error", (error: { error: string }) => {
      console.error("[Canvas] AI error:", error);
      alert(`AI Analysis Error: ${error.error}`);
      setAnalyzing(false);
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-black-100">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <CanvasRenderer
            onCursorMove={emitCursorMove}
            onImageAnalyze={handleImageAnalyze}
          />
          <RemoteCursors sessions={remoteSessions} />
          <ConnectionStatus
            isConnected={isConnected}
            userCount={remoteSessions.length}
          />
          <ViewportControls />
          <ComponentSuggestionPanel />
          <ComponentPreviewPanel />
        </div>
        <PropertiesPanel />
      </div>

      {/* AI Results Modal */}
      {aiResult ? (
        <AIResultsModal onClose={() => setAiResult(null)} result={aiResult} />
      ) : null}

      {/* Analyzing Overlay */}
      {analyzing ? (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600" />
            <div className="text-center">
              <p className="font-semibold text-lg">Analyzing with AI...</p>
              <p className="text-sm text-black-600 mt-1">
                This may take 10-30 seconds
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

const Canvas = () => (
  <CanvasProvider>
    <CanvasContent />
  </CanvasProvider>
);

export default Canvas;
