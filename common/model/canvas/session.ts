export interface Session {
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

