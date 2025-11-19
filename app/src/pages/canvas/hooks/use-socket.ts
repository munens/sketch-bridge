import { useCallback, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useCanvas } from "../context";
import { CanvasObject, Session } from "../types";

const SOCKET_URL = "http://localhost:3001";

export const useSocket = (
  canvasId: string,
  userId: string,
  userName: string,
) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteSessions, setRemoteSessions] = useState<Session[]>([]);
  const {
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setObjects,
    setEmitCallbacks,
  } = useCanvas();

  useEffect(() => {
    console.log("[Socket] Attempting to connect to:", SOCKET_URL);
    console.log("[Socket] Canvas ID:", canvasId);
    console.log("[Socket] User ID:", userId);
    console.log("[Socket] User Name:", userName);

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected successfully! Socket ID:", socket.id);
      setIsConnected(true);

      socket.emit("join_canvas", {
        canvasId,
        userId,
        userName,
      });
      console.log("[Socket] Emitted join_canvas event");
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
      (data: { canvas: any; objects: CanvasObject[]; sessions: Session[] }) => {
        console.log("[Socket] Received canvas_sync:", {
          objectCount: data.objects.length,
          sessionCount: data.sessions.length,
        });
        setObjects(data.objects);
        setRemoteSessions(data.sessions.filter((s) => s.id !== socket.id));
      },
    );

    socket.on("user_joined", (data: { session: Session }) => {
      if (data.session.id !== socket.id) {
        setRemoteSessions((prev) => [...prev, data.session]);
      }
    });

    socket.on("user_left", (data: { sessionId: string }) => {
      setRemoteSessions((prev) => prev.filter((s) => s.id !== data.sessionId));
    });

    socket.on(
      "cursor_move",
      (data: { sessionId: string; x: number; y: number }) => {
        setRemoteSessions((prev) =>
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
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Received object_add:", data.object.id);
          addObject(data.object, true);
        }
      },
    );

    socket.on(
      "object_update",
      (data: { object: CanvasObject; sessionId: string }) => {
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Received object_update:", data.object.id);
          updateObject(data.object.id, data.object, true);
        }
      },
    );

    socket.on(
      "object_delete",
      (data: { objectId: string; sessionId: string }) => {
        if (data.sessionId !== socket.id) {
          console.log("[Socket] Received object_delete:", data.objectId);
          deleteObject(data.objectId, true);
          selectObject(null);
        }
      },
    );

    socket.on("error", (error: { message: string; code: string }) => {
      console.error("Socket error:", error);
    });

    return () => {
      socket.emit("leave_canvas", { canvasId });
      socket.disconnect();
    };
  }, [
    canvasId,
    userId,
    userName,
    addObject,
    updateObject,
    deleteObject,
    selectObject,
    setObjects,
  ]);

  useEffect(() => {
    setEmitCallbacks({
      onObjectAdd: emitObjectAdd,
      onObjectUpdate: emitObjectUpdate,
      onObjectDelete: emitObjectDelete,
    });
  }, [setEmitCallbacks]);

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
        console.log("[Socket] Emitting object_add:", object.id);
        socketRef.current.emit("object_add", {
          canvasId,
          object,
        });
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

  return {
    isConnected,
    remoteSessions,
    emitCursorMove,
    emitObjectAdd,
    emitObjectUpdate,
    emitObjectDelete,
  };
};
