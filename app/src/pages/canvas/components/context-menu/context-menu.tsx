import { useEffect, useState } from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onAnalyze: () => void;
  onClose: () => void;
}

const ContextMenu = ({ x, y, onAnalyze, onClose }: ContextMenuProps) => {
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the context menu
      if ((e.target as HTMLElement).closest("[data-context-menu]")) {
        return;
      }
      onClose();
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Add a small delay before attaching click listener to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClick);
      document.addEventListener("keydown", handleEscape);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await onAnalyze();
    setAnalyzing(false);
    onClose();
  };

  return (
    <div
      className="fixed bg-white border border-black-300 rounded-lg shadow-xl py-2 min-w-48 z-50"
      data-context-menu
      onClick={(e) => e.stopPropagation()}
      style={{ left: x, top: y }}
    >
      <button
        className="w-full px-4 py-2 text-left hover:bg-black-100 transition-colors flex items-center gap-3 disabled:opacity-50"
        disabled={analyzing}
        onClick={handleAnalyze}
        type="button"
      >
        <span className="text-lg">🤖</span>
        <div className="flex-1">
          <div className="font-medium text-sm">
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </div>
          <div className="text-xs text-black-600">
            Detect components and generate code
          </div>
        </div>
      </button>
    </div>
  );
};

export default ContextMenu;
