interface HostLobbyViewProps {
  lobby: any;
  socket: any;
}

export default function HostLobbyView({ lobby, socket }: HostLobbyViewProps) {
  return (
    <div className="min-h-screen bg-primary p-lg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-xl">
          <h1 className="text-4xl font-bold text-white mb-md">🎯 Bull Game</h1>
          <div className="bg-white rounded-lg p-lg shadow-lg">
            <h2 className="text-3xl font-bold text-primary mb-sm">
              Código del Lobby
            </h2>
            <div className="text-6xl font-mono font-bold text-accent tracking-wider">
              {lobby.code}
            </div>
            <p className="text-secondary mt-md">
              Los jugadores pueden unirse ingresando este código
            </p>
          </div>
        </div>

        {/* Jugadores conectados */}
        <div className="grid md:grid-cols-2 gap-lg mb-xl">
          {/* Equipo Azul */}
          <div className="bg-blue-600 rounded-lg p-lg text-white">
            <h3 className="text-2xl font-bold mb-md flex items-center">
              🔵 Equipo Azul
              <span className="ml-auto text-lg">
                ({lobby.teams?.blue?.length || 0}/4)
              </span>
            </h3>
            <div className="space-y-sm">
              {lobby.teams?.blue?.map((player: any, index: number) => (
                <div
                  key={index}
                  className="bg-blue-700 rounded-md p-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.role === 'active' ? (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                        ✍️ ACTIVO
                      </span>
                    ) : (
                      <span className="text-xs bg-blue-300 text-blue-900 px-2 py-0.5 rounded-full font-semibold">
                        👀 PÚBLICO
                      </span>
                    )}
                  </div>
                  {player.role === 'active' && player.isReady && (
                    <span className="text-green-300">✓ Listo</span>
                  )}
                </div>
              )) || <p className="text-blue-200 italic">Sin jugadores</p>}
            </div>
          </div>

          {/* Equipo Rojo */}
          <div className="bg-red-600 rounded-lg p-lg text-white">
            <h3 className="text-2xl font-bold mb-md flex items-center">
              🔴 Equipo Rojo
              <span className="ml-auto text-lg">
                ({lobby.teams?.red?.length || 0}/4)
              </span>
            </h3>
            <div className="space-y-sm">
              {lobby.teams?.red?.map((player: any, index: number) => (
                <div
                  key={index}
                  className="bg-red-700 rounded-md p-sm flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{player.name}</span>
                    {player.role === 'active' ? (
                      <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                        ✍️ ACTIVO
                      </span>
                    ) : (
                      <span className="text-xs bg-red-300 text-red-900 px-2 py-0.5 rounded-full font-semibold">
                        👀 PÚBLICO
                      </span>
                    )}
                  </div>
                  {player.role === 'active' && player.isReady && (
                    <span className="text-green-300">✓ Listo</span>
                  )}
                </div>
              )) || <p className="text-red-200 italic">Sin jugadores</p>}
            </div>
          </div>
        </div>

        {/* Controles del Host */}
        <div className="bg-white rounded-lg p-lg shadow-lg text-center">
          <h3 className="text-2xl font-bold text-primary mb-md">
            Controles del Host
          </h3>
          <div className="space-y-md">
            <button
              className="btn btn-success text-lg px-xl py-md"
              onClick={() => {
                if (socket) {
                  socket.emit('start_game');
                }
              }}
              disabled={
                !lobby.teams?.blue?.length ||
                !lobby.teams?.red?.length ||
                !lobby.players?.every((p: any) => p.isReady)
              }
            >
              🚀 Iniciar Juego
            </button>
            <p className="text-secondary text-sm">
              Necesitas al menos un jugador por equipo y que todos estén listos
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-lg bg-gray-800 rounded-lg p-lg text-white">
          <h4 className="text-lg font-bold mb-sm">
            ℹ️ Instrucciones para el Público
          </h4>
          <p className="text-gray-300">
            Esta pantalla se puede mostrar al público durante el juego. Los
            espectadores podrán ver el progreso del juego, las preguntas,
            respuestas y puntuaciones en tiempo real.
          </p>
        </div>
      </div>
    </div>
  );
}
