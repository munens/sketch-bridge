import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useCanvas } from "../context";
import { CanvasObject, Session } from "../types";

const socketUrl = "http://localhost:3001";

export const useSocket = (
  canvasId: string,
  userId: string,
  userName: string,
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteSessions, setRemoteSessions] = useState<Session[]>([]);

  // Debug: Track remote sessions changes
  useEffect(() => {
    console.log('[Socket] 👥 Remote sessions state changed:', {
      count: remoteSessions.length,
      users: remoteSessions.map(s => ({ 
        id: s.id, 
        userId: s.userId, 
        userName: s.userName 
      }))
    });
  }, [remoteSessions]);
  const {
    objects,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setObjects,
    setEmitCallbacks,
  } = useCanvas();

  // Use refs to store the latest callback functions
  // This prevents the socket useEffect from re-running when callbacks change
  const callbacksRef = useRef({
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setObjects,
    setRemoteSessions,
  });

  // Update refs when callbacks change
  useEffect(() => {
    callbacksRef.current = {
      addObject,
      updateObject,
      deleteObject,
      selectObject,
      setObjects,
      setRemoteSessions,
    };
  }, [addObject, updateObject, deleteObject, selectObject, setObjects, setRemoteSessions]);

  useEffect(() => {
    console.log("[Socket] Attempting to connect to:", socketUrl);
    console.log("[Socket] Canvas ID:", canvasId);
    console.log("[Socket] User ID:", userId);
    console.log("[Socket] User Name:", userName);

    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] 🔵 Connected successfully! Socket ID:", socket.id);
      console.log("[Socket] 🔵 My userId:", userId, "userName:", userName);
      setIsConnected(true);

      socket.emit("join_canvas", {
        canvasId,
        userId,
        userName,
      });
      console.log("[Socket] 📤 Emitted join_canvas event");
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
      console.error("[Socket] Error details:", error);
      setIsConnected(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected. Reason:", reason);
      setIsConnected(false);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log("[Socket] Reconnection attempt #", attemptNumber);
    });

    socket.on("reconnect_failed", () => {
      console.error("[Socket] Reconnection failed after all attempts");
    });

    socket.on(
      "canvas_sync",
      (data: {
        canvas: unknown;
        objects: CanvasObject[];
        sessions: Session[];
      }) => {
        console.log("[Socket] ⚠️ Received canvas_sync - THIS REPLACES ALL OBJECTS:", {
          objectCount: data.objects.length,
          sessionCount: data.sessions.length,
          objectDetails: data.objects.map(o => ({ 
            id: o.id, 
            type: o.type,
            hasImageData: !!(o as any).imageData 
          }))
        });
        console.log("[Socket] Current objects before sync:", objects.length);
        console.log("[Socket] 👥 Sessions from canvas_sync:", {
          total: data.sessions.length,
          mySocketId: socket.id,
          allSessions: data.sessions.map(s => ({ 
            id: s.id, 
            userId: s.userId, 
            userName: s.userName 
          })),
          afterFilter: data.sessions.filter((s) => s.id !== socket.id).length
        });
        callbacksRef.current.setObjects(data.objects);
        const filteredSessions = data.sessions.filter((s) => s.id !== socket.id);
        console.log("[Socket] 👥 Setting remote sessions to:", filteredSessions.length);
        callbacksRef.current.setRemoteSessions(filteredSessions);
      },
    );

    socket.on("user_joined", (data: { session: Session }) => {
      console.log("[Socket] 👥 USER_JOINED event:", {
        newUser: data.session.userName,
        newSessionId: data.session.id,
        isMe: data.session.id === socket.id
      });
      if (data.session.id !== socket.id) {
        callbacksRef.current.setRemoteSessions((prev) => {
          console.log("[Socket] 👥 Adding user to remote sessions. Before:", prev.length, "After:", prev.length + 1);
          return [...prev, data.session];
        });
      } else {
        console.log("[Socket] 👥 Ignoring USER_JOINED for myself");
      }
    });

    socket.on("user_left", (data: { sessionId: string }) => {
      console.log("[Socket] 👥 USER_LEFT event:", data.sessionId);
      callbacksRef.current.setRemoteSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== data.sessionId);
        console.log("[Socket] 👥 Removing user. Before:", prev.length, "After:", filtered.length);
        return filtered;
      });
    });

    socket.on(
      "cursor_move",
      (data: { sessionId: string; x: number; y: number }) => {
        callbacksRef.current.setRemoteSessions((prev) =>
          prev.map((session) =>
            session.id === data.sessionId
              ? { ...session, cursorX: data.x, cursorY: data.y }
              : session,
          ),
        );
      },
    );

    socket.on(
      "object_add",
      (data: { object: CanvasObject; sessionId: string }) => {
        console.log("[Socket] Received object_add event:", {
          objectId: data.object.id,
          objectType: data.object.type,
          fromSessionId: data.sessionId,
          mySessionId: socket.id,
          willAdd: data.sessionId !== socket.id
        });
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Adding object from another user:", data.object.id);
          callbacksRef.current.addObject(data.object, true);
        } else {
          console.log("[Socket] Ignoring own object_add event");
        }
      },
    );

    socket.on(
      "object_update",
      (data: { object: CanvasObject; sessionId: string }) => {
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Received object_update:", data.object.id);
          callbacksRef.current.updateObject(data.object.id, data.object, true);
        }
      },
    );

    socket.on(
      "object_delete",
      (data: { objectId: string; sessionId: string }) => {
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Received object_delete:", data.objectId);
          callbacksRef.current.deleteObject(data.objectId, true);
          callbacksRef.current.selectObject(null);
        }
      },
    );

    socket.on("clear_canvas", (data: { sessionId: string }) => {
      if (data.sessionId !== socket.id) {
        console.log("[Socket] Received clear_canvas from another user");
        callbacksRef.current.setObjects([]);
        callbacksRef.current.selectObject(null);
      }
    });

    socket.on("error", (error: { message: string; code: string }) => {
      console.error("Socket error:", error);
    });

    return () => {
      console.log("[Socket] Disconnecting socket...");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("canvas_sync");
      socket.off("user_joined");
      socket.off("user_left");
      socket.off("cursor_move");
      socket.off("object_add");
      socket.off("object_update");
      socket.off("object_delete");
      socket.off("clear_canvas");
      socket.disconnect();
    };
    // IMPORTANT: Only re-run this effect if connection params change
    // Callback functions (addObject, setObjects, etc.) are accessed via callbacksRef
    // so they DON'T trigger reconnection when they change
  }, [canvasId, userId, userName]);

  const emitCursorMove = (x: number, y: number) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("cursor_move", {
        canvasId,
        x,
        y,
      });
    }
  };

  const emitObjectAdd = useCallback(
    (object: CanvasObject) => {
      if (socketRef.current?.connected) {
        console.log("[Socket] Emitting object_add:", object.id, 'type:', object.type);
        console.log("[Socket] Object data:", JSON.stringify(object).substring(0, 200));
        socketRef.current.emit("object_add", {
          canvasId,
          object,
        });
      } else {
        console.error("[Socket] Cannot emit - socket not connected!");
      }
    },
    [canvasId],
  );

  const emitObjectUpdate = useCallback(
    (objectId: string, updates: Partial<CanvasObject>) => {
      if (socketRef.current?.connected) {
        console.log("[Socket] Emitting object_update:", objectId);
        socketRef.current.emit("object_update", {
          canvasId,
          objectId,
          updates,
        });
      }
    },
    [canvasId],
  );

  const emitObjectDelete = useCallback(
    (objectId: string) => {
      if (socketRef.current?.connected) {
        console.log("[Socket] Emitting object_delete:", objectId);
        socketRef.current.emit("object_delete", {
          canvasId,
          objectId,
        });
      }
    },
    [canvasId],
  );

  const emitClearCanvas = useCallback(() => {
    if (socketRef.current?.connected) {
      console.log("[Socket] Emitting clear_canvas");
      socketRef.current.emit("clear_canvas", {
        canvasId,
      });
    }
  }, [canvasId]);

  useEffect(() => {
    setEmitCallbacks({
      onObjectAdd: emitObjectAdd,
      onObjectUpdate: emitObjectUpdate,
      onObjectDelete: emitObjectDelete,
      onClearCanvas: emitClearCanvas,
    });
  }, [
    setEmitCallbacks,
    emitObjectAdd,
    emitObjectUpdate,
    emitObjectDelete,
    emitClearCanvas,
  ]);

  return {
    socket: socketRef.current,
    isConnected,
    remoteSessions,
    emitCursorMove,
    emitObjectAdd,
    emitObjectUpdate,
    emitObjectDelete,
    emitClearCanvas,
  };
};
