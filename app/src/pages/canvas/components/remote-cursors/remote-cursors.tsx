import { useViewport } from "../../hooks";

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

interface RemoteCursorsProps {
  sessions: Session[];
}

const RemoteCursors = ({ sessions }: RemoteCursorsProps) => {
  const { viewport } = useViewport();

  return (
    <>
      {sessions.map((session) => {
        const screenX = (session.cursorX - viewport.x) * viewport.zoom;
        const screenY = (session.cursorY - viewport.y) * viewport.zoom;

        const isVisible =
          screenX >= -50 &&
          screenX <= window.innerWidth + 50 &&
          screenY >= -50 &&
          screenY <= window.innerHeight + 50;

        if (!isVisible) return null;

        return (
          <div
            className="absolute pointer-events-none z-50"
            key={session.id}
            style={{
              left: `${screenX}px`,
              top: `${screenY}px`,
              transform: "translate(-2px, -2px)",
              transition:
                "left 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
              willChange: "left, top",
            }}
          >
            <svg
              fill="none"
              height="24"
              style={{
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 3L19 12L12 13L9 20L5 3Z"
                fill={session.color}
                stroke="white"
                strokeLinejoin="round"
                strokeWidth="1.5"
              />
            </svg>
            <div
              className="mt-1 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: session.color,
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {session.userName}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default RemoteCursors;
