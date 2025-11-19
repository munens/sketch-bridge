import { useState } from 'react';
import { CanvasProvider } from './context';
import { CanvasRenderer, Toolbar, PropertiesPanel, ViewportControls, RemoteCursors, ConnectionStatus } from './components';
import { useSocket } from './hooks';

const generateId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const CanvasContent = () => {
  const canvasId = 'default-canvas';
  const [userId] = useState(() => {
    const stored = localStorage.getItem('sketch-bridge-user-id');
    if (stored) return stored;
    const newId = generateId();
    localStorage.setItem('sketch-bridge-user-id', newId);
    return newId;
  });
  const [userName] = useState(() => {
    const stored = localStorage.getItem('sketch-bridge-user-name');
    if (stored) return stored;
    const newName = `User ${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('sketch-bridge-user-name', newName);
    return newName;
  });

  const {
    isConnected,
    remoteSessions,
    emitCursorMove
  } = useSocket(canvasId, userId, userName);

  return (
    <div className="w-screen h-screen flex flex-col bg-black-100">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <CanvasRenderer onCursorMove={emitCursorMove} />
          <RemoteCursors sessions={remoteSessions} />
          <ConnectionStatus 
            isConnected={isConnected} 
            userCount={remoteSessions.length}
          />
          <ViewportControls />
        </div>
        <PropertiesPanel />
      </div>
    </div>
  );
};

const Canvas = () => {
  return (
    <CanvasProvider>
      <CanvasContent />
    </CanvasProvider>
  );
};

export default Canvas;

