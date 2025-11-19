interface ConnectionStatusProps {
  isConnected: boolean;
  userCount: number;
}

const ConnectionStatus = ({
  isConnected,
  userCount,
}: ConnectionStatusProps) => (
  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-black-300 rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-4 transition-all duration-200">
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-2 h-2 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        {isConnected ? (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
        ) : null}
      </div>
      <span
        className={`text-sm font-medium ${
          isConnected ? "text-green-700" : "text-red-700"
        }`}
      >
        {isConnected ? "Live" : "Offline"}
      </span>
    </div>

    {isConnected && userCount > 0 ? (
      <>
        <div className="h-4 w-px bg-black-300" />
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(userCount, 3) }).map((_, i) => (
              <div
                className="w-5 h-5 rounded-full bg-gradient-to-br from-token-primary to-token-primary-dark border-2 border-white"
                key={i}
                style={{
                  transform: `translateX(${i * 2}px)`,
                }}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-black-900">
            {userCount}
          </span>
          <span className="text-sm text-black-600">
            {userCount === 1 ? "collaborator" : "collaborators"}
          </span>
        </div>
      </>
    ) : null}
  </div>
);

export default ConnectionStatus;
