import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useCanvas } from '../context';
import { CanvasObject } from '../types';

interface Session {
  id: string;
  userId: string;
  userName: string;
  canvasId: string;
  cursorX: number;
  cursorY: number;
  color: string;
  connectedAt: number;
  lastActivity: number;
}

const SOCKET_URL = 'http://localhost:3001';

export const useSocket = (canvasId: string, userId: string, userName: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteSessions, setRemoteSessions] = useState<Session[]>([]);
  const { addObject, updateObject, deleteObject, selectObject } = useCanvas();

  useEffect(() => {
    console.log('[Socket] Attempting to connect to:', SOCKET_URL);
    console.log('[Socket] Canvas ID:', canvasId);
    console.log('[Socket] User ID:', userId);
    console.log('[Socket] User Name:', userName);

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected successfully! Socket ID:', socket.id);
      setIsConnected(true);
      
      socket.emit('join_canvas', {
        canvasId,
        userId,
        userName
      });
      console.log('[Socket] Emitted join_canvas event');
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      console.error('[Socket] Error details:', error);
      setIsConnected(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected. Reason:', reason);
      setIsConnected(false);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('[Socket] Reconnection attempt #', attemptNumber);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed after all attempts');
    });

    socket.on('canvas_sync', (data: { 
      canvas: any; 
      objects: CanvasObject[]; 
      sessions: Session[] 
    }) => {
      setRemoteSessions(data.sessions.filter(s => s.id !== socket.id));
    });

    socket.on('user_joined', (data: { session: Session }) => {
      if (data.session.id !== socket.id) {
        setRemoteSessions(prev => [...prev, data.session]);
      }
    });

    socket.on('user_left', (data: { sessionId: string }) => {
      setRemoteSessions(prev => prev.filter(s => s.id !== data.sessionId));
    });

    socket.on('cursor_move', (data: { sessionId: string; x: number; y: number }) => {
      setRemoteSessions(prev =>
        prev.map(session =>
          session.id === data.sessionId
            ? { ...session, cursorX: data.x, cursorY: data.y }
            : session
        )
      );
    });

    socket.on('object_add', (data: { object: CanvasObject; sessionId: string }) => {
      if (data.sessionId !== socket.id) {
        addObject(data.object);
      }
    });

    socket.on('object_update', (data: { object: CanvasObject; sessionId: string }) => {
      if (data.sessionId !== socket.id) {
        updateObject(data.object.id, data.object);
      }
    });

    socket.on('object_delete', (data: { objectId: string; sessionId: string }) => {
      if (data.sessionId !== socket.id) {
        deleteObject(data.objectId);
        selectObject(null);
      }
    });

    socket.on('error', (error: { message: string; code: string }) => {
      console.error('Socket error:', error);
    });

    return () => {
      socket.emit('leave_canvas', { canvasId });
      socket.disconnect();
    };
  }, [canvasId, userId, userName, addObject, updateObject, deleteObject, selectObject]);

  const emitCursorMove = (x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('cursor_move', {
        canvasId,
        x,
        y
      });
    }
  };

  const emitObjectAdd = (object: CanvasObject) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('object_add', {
        canvasId,
        object
      });
    }
  };

  const emitObjectUpdate = (objectId: string, updates: Partial<CanvasObject>) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('object_update', {
        canvasId,
        objectId,
        updates
      });
    }
  };

  const emitObjectDelete = (objectId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('object_delete', {
        canvasId,
        objectId
      });
    }
  };

  return {
    isConnected,
    remoteSessions,
    emitCursorMove,
    emitObjectAdd,
    emitObjectUpdate,
    emitObjectDelete
  };
};

