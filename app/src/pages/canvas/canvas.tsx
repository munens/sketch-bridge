import { CanvasProvider } from './context';
import { CanvasRenderer, Toolbar, PropertiesPanel, ViewportControls } from './components';

const Canvas = () => {
  return (
    <CanvasProvider>
      <div className="w-screen h-screen flex flex-col bg-black-100">
        <Toolbar />
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <CanvasRenderer />
            <ViewportControls />
          </div>
          <PropertiesPanel />
        </div>
      </div>
    </CanvasProvider>
  );
};

export default Canvas;

