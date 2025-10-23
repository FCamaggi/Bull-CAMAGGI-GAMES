interface HostLobbyViewProps {
  lobby: any;
  socket: any;
}

export default function HostLobbyView({ lobby, socket }: HostLobbyViewProps) {
  // Calcular estadísticas de equipos
  const blueActive = lobby.teams?.blue?.filter((p: any) => p.role === 'active').length || 0;
  const blueSpectators = lobby.teams?.blue?.filter((p: any) => p.role === 'spectator').length || 0;
  const redActive = lobby.teams?.red?.filter((p: any) => p.role === 'active').length || 0;
  const redSpectators = lobby.teams?.red?.filter((p: any) => p.role === 'spectator').length || 0;
  
  // Contar jugadores activos listos
  const blueActiveReady = lobby.teams?.blue?.filter((p: any) => p.role === 'active' && p.isReady).length || 0;
  const redActiveReady = lobby.teams?.red?.filter((p: any) => p.role === 'active' && p.isReady).length || 0;
  
  // Verificar si se puede iniciar
  const canStart = blueActive > 0 && redActive > 0 && 
                   blueActiveReady === blueActive && redActiveReady === redActive;

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
            <h3 className="text-2xl font-bold mb-md">
              🔵 Equipo Azul
            </h3>
            <div className="text-sm mb-md flex justify-between">
              <span>✍️ Activos: {blueActive}/4</span>
              <span>👀 Público: {blueSpectators}/8</span>
            </div>
            
            {/* Jugadores Activos */}
            {blueActive > 0 && (
              <div className="mb-md">
                <p className="text-xs font-semibold mb-1 text-blue-200">JUGADORES ACTIVOS</p>
                <div className="space-y-sm">
                  {lobby.teams?.blue?.filter((p: any) => p.role === 'active').map((player: any) => (
                    <div
                      key={player.id}
                      className="bg-blue-700 rounded-md p-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                          ✍️
                        </span>
                      </div>
                      {player.isReady ? (
                        <span className="text-green-300 font-bold">✓</span>
                      ) : (
                        <span className="text-yellow-300 text-xs">Esperando...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Público */}
            {blueSpectators > 0 && (
              <div>
                <p className="text-xs font-semibold mb-1 text-blue-200">PÚBLICO</p>
                <div className="space-y-sm">
                  {lobby.teams?.blue?.filter((p: any) => p.role === 'spectator').map((player: any) => (
                    <div
                      key={player.id}
                      className="bg-blue-800 rounded-md p-sm flex items-center gap-2"
                    >
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs bg-blue-300 text-blue-900 px-2 py-0.5 rounded-full font-semibold">
                        👀
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {blueActive === 0 && blueSpectators === 0 && (
              <p className="text-blue-200 italic text-center py-4">Sin jugadores</p>
            )}
          </div>

          {/* Equipo Rojo */}
          <div className="bg-red-600 rounded-lg p-lg text-white">
            <h3 className="text-2xl font-bold mb-md">
              🔴 Equipo Rojo
            </h3>
            <div className="text-sm mb-md flex justify-between">
              <span>✍️ Activos: {redActive}/4</span>
              <span>👀 Público: {redSpectators}/8</span>
            </div>
            
            {/* Jugadores Activos */}
            {redActive > 0 && (
              <div className="mb-md">
                <p className="text-xs font-semibold mb-1 text-red-200">JUGADORES ACTIVOS</p>
                <div className="space-y-sm">
                  {lobby.teams?.red?.filter((p: any) => p.role === 'active').map((player: any) => (
                    <div
                      key={player.id}
                      className="bg-red-700 rounded-md p-sm flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                          ✍️
                        </span>
                      </div>
                      {player.isReady ? (
                        <span className="text-green-300 font-bold">✓</span>
                      ) : (
                        <span className="text-yellow-300 text-xs">Esperando...</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Público */}
            {redSpectators > 0 && (
              <div>
                <p className="text-xs font-semibold mb-1 text-red-200">PÚBLICO</p>
                <div className="space-y-sm">
                  {lobby.teams?.red?.filter((p: any) => p.role === 'spectator').map((player: any) => (
                    <div
                      key={player.id}
                      className="bg-red-800 rounded-md p-sm flex items-center gap-2"
                    >
                      <span className="font-medium">{player.name}</span>
                      <span className="text-xs bg-red-300 text-red-900 px-2 py-0.5 rounded-full font-semibold">
                        👀
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {redActive === 0 && redSpectators === 0 && (
              <p className="text-red-200 italic text-center py-4">Sin jugadores</p>
            )}
          </div>
        </div>

        {/* Controles del Host */}
        <div className="bg-white rounded-lg p-lg shadow-lg text-center">
          <h3 className="text-2xl font-bold text-primary mb-md">
            👑 Controles del Host
          </h3>
          <div className="space-y-md">
            <button
              className="btn btn-success text-lg px-xl py-md w-full md:w-auto"
              onClick={() => {
                if (socket) {
                  socket.emit('start_game');
                }
              }}
              disabled={!canStart}
            >
              🚀 Iniciar Juego
            </button>
            {!canStart && (
              <div className="text-sm text-secondary">
                {blueActive === 0 || redActive === 0 ? (
                  <p>⚠️ Cada equipo necesita al menos 1 jugador activo</p>
                ) : (
                  <p>⏳ Esperando que todos los jugadores activos marquen "Listo"</p>
                )}
              </div>
            )}
            {canStart && (
              <p className="text-success text-sm font-medium">
                ✅ ¡Listo para comenzar!
              </p>
            )}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-lg bg-gray-800 rounded-lg p-lg text-white">
          <h4 className="text-lg font-bold mb-sm">
            ℹ️ Configuración del Juego
          </h4>
          <div className="grid md:grid-cols-2 gap-md text-sm">
            <div>
              <p className="text-gray-400">Jugadores Activos por Equipo:</p>
              <p className="font-bold">Máximo 4</p>
            </div>
            <div>
              <p className="text-gray-400">Público por Equipo:</p>
              <p className="font-bold">Máximo 8</p>
            </div>
            <div>
              <p className="text-gray-400">Rondas:</p>
              <p className="font-bold">{lobby.settings?.maxRounds || 8}</p>
            </div>
            <div>
              <p className="text-gray-400">Jugadores Totales:</p>
              <p className="font-bold">{lobby.players?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
