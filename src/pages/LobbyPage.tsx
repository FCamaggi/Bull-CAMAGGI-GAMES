interface LobbyPageProps {
  game: any; // Usamos any por ahora para evitar errores de tipos
}

export default function LobbyPage({ game }: LobbyPageProps) {
  const { lobby, playerId, isHost, currentPlayer } = game;

  if (!lobby) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="card">
          <p>Cargando lobby...</p>
        </div>
      </div>
    );
  }

  const handleSelectTeam = (team: 'blue' | 'red') => {
    game.selectTeam(team);
  };

  const handleToggleReady = () => {
    game.toggleReady();
  };

  const handleStartGame = () => {
    game.startGame();
  };

  const handleLeaveLobby = () => {
    game.leaveLobby();
  };

  const canStartGame = game.canStartGame;
  const blueTeam = lobby.teams.blue || [];
  const redTeam = lobby.teams.red || [];

  // Calcular espacios disponibles para jugadores activos
  const blueActiveCount = blueTeam.filter((p: any) => p.role === 'active').length;
  const redActiveCount = redTeam.filter((p: any) => p.role === 'active').length;
  const blueActiveSlotsAvailable = 2 - blueActiveCount;
  const redActiveSlotsAvailable = 2 - redActiveCount;

  return (
    <div className="min-h-screen bg-primary py-lg">
      <div className="container">
        {/* Header */}
        <div className="card mb-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-md">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-sm">
                🎯 LOBBY: {lobby.code}
              </h1>
              <p className="text-secondary">
                Comparte este código con tus amigos
              </p>
            </div>
            <button
              onClick={handleLeaveLobby}
              className="btn btn-secondary mt-md md:mt-0"
            >
              Salir
            </button>
          </div>

          {/* Estado del juego */}
          <div className="flex items-center gap-md">
            <span className="text-sm text-muted">Estado:</span>
            <span
              className={`px-md py-xs rounded text-sm font-medium ${
                lobby.status === 'waiting'
                  ? 'bg-warning text-white'
                  : 'bg-success text-white'
              }`}
            >
              {lobby.status === 'waiting' ? 'Esperando jugadores' : 'En juego'}
            </span>
          </div>
        </div>

        {/* Selección de equipos */}
        <div className="grid md:grid-cols-2 gap-lg mb-lg">
          {/* Información sobre roles */}
          {!currentPlayer?.team && !isHost && (
            <div className="md:col-span-2 card bg-blue-50 border border-blue-200">
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">ℹ️ Cómo funcionan los roles:</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li><strong>Jugadores Activos (✍️):</strong> Los primeros 2 de cada equipo. Escriben respuestas falsas en cada ronda.</li>
                  <li><strong>Público (👀):</strong> Jugadores 3+ de cada equipo. Solo votan, no escriben respuestas.</li>
                  <li><strong>Host (👑):</strong> Controla el juego pero no juega.</li>
                </ul>
              </div>
            </div>
          )}

          {/* Equipo Azul */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-xl font-bold text-blue">🔵 Equipo Azul</h2>
              <div className="text-right">
                <div className="text-sm text-muted">{blueTeam.length} jugadores</div>
                <div className="text-xs text-muted">
                  {blueActiveCount}/2 activos • {blueTeam.length - blueActiveCount} público
                </div>
              </div>
            </div>

            <div className="space-y-sm mb-md">
              {blueTeam.map((player: any) => (
                <div
                  key={player.id}
                  className={`p-md rounded-lg border-2 ${
                    player.isReady
                      ? 'border-success bg-success/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {player.name}
                          {player.isHost && ' 👑'}
                          {player.id === playerId && ' (TÚ)'}
                        </span>
                        {player.role === 'active' ? (
                          <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                            ✍️ ACTIVO
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                            👀 PÚBLICO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="text-sm text-muted">
                          {player.score} pts
                        </span>
                        {player.role === 'active' && player.isReady && (
                          <span className="text-success">✓</span>
                        )}
                        {!player.isConnected && (
                          <span className="text-error">⚠️</span>
                        )}
                      </div>
                    </div>
                    {player.role === 'spectator' && (
                      <span className="text-xs text-muted">
                        Solo vota, no escribe respuestas
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {blueTeam.length === 0 && (
                <div className="p-md text-center text-muted border-2 border-dashed border-border rounded-lg">
                  Sin jugadores
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelectTeam('blue')}
              disabled={
                isHost || 
                currentPlayer?.team === 'blue'
              }
              className="btn btn-blue w-full"
            >
              {isHost 
                ? '👑 El Host no juega'
                : currentPlayer?.team === 'blue'
                ? `${currentPlayer.role === 'active' ? '✍️ ' : '👀 '}En Equipo Azul`
                : blueActiveSlotsAvailable > 0 
                ? `Unirse como Activo (${blueActiveSlotsAvailable} lugares)`
                : 'Unirse como Público'}
            </button>
          </div>

          {/* Equipo Rojo */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-xl font-bold text-red">🔴 Equipo Rojo</h2>
              <div className="text-right">
                <div className="text-sm text-muted">{redTeam.length} jugadores</div>
                <div className="text-xs text-muted">
                  {redActiveCount}/2 activos • {redTeam.length - redActiveCount} público
                </div>
              </div>
            </div>

            <div className="space-y-sm mb-md">
              {redTeam.map((player: any) => (
                <div
                  key={player.id}
                  className={`p-md rounded-lg border-2 ${
                    player.isReady
                      ? 'border-success bg-success/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {player.name}
                          {player.isHost && ' 👑'}
                          {player.id === playerId && ' (TÚ)'}
                        </span>
                        {player.role === 'active' ? (
                          <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                            ✍️ ACTIVO
                          </span>
                        ) : (
                          <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full font-semibold">
                            👀 PÚBLICO
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-sm">
                        <span className="text-sm text-muted">
                          {player.score} pts
                        </span>
                        {player.role === 'active' && player.isReady && (
                          <span className="text-success">✓</span>
                        )}
                        {!player.isConnected && (
                          <span className="text-error">⚠️</span>
                        )}
                      </div>
                    </div>
                    {player.role === 'spectator' && (
                      <span className="text-xs text-muted">
                        Solo vota, no escribe respuestas
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {redTeam.length === 0 && (
                <div className="p-md text-center text-muted border-2 border-dashed border-border rounded-lg">
                  Sin jugadores
                </div>
              )}
            </div>

            <button
              onClick={() => handleSelectTeam('red')}
              disabled={
                isHost || 
                currentPlayer?.team === 'red'
              }
              className="btn btn-red w-full"
            >
              {isHost 
                ? '👑 El Host no juega'
                : currentPlayer?.team === 'red'
                ? `${currentPlayer.role === 'active' ? '✍️ ' : '👀 '}En Equipo Rojo`
                : redActiveSlotsAvailable > 0 
                ? `Unirse como Activo (${redActiveSlotsAvailable} lugares)`
                : 'Unirse como Público'}
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="card">
          {/* Mensaje para espectadores */}
          {currentPlayer?.team && currentPlayer.role === 'spectator' && (
            <div className="mb-md p-md bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                👀 <strong>Eres parte del público:</strong> Votarás en cada
                ronda pero no escribirás respuestas. Los primeros 2 jugadores de
                cada equipo son jugadores activos.
              </p>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-md items-center">
            {/* Ready toggle - solo para jugadores activos */}
            {currentPlayer?.team && currentPlayer.role === 'active' && (
              <button
                onClick={handleToggleReady}
                className={`btn ${
                  currentPlayer.isReady ? 'btn-success' : 'btn-secondary'
                } flex-1`}
              >
                {currentPlayer.isReady ? '✓ Listo' : 'Marcar como Listo'}
              </button>
            )}

            {/* Mensaje para espectadores */}
            {currentPlayer?.team && currentPlayer.role === 'spectator' && (
              <div className="flex-1 text-center p-md bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-700">
                  ✅ Listo para jugar (el público no necesita marcar ready)
                </p>
              </div>
            )}

            {/* Start game (solo host) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="btn btn-primary flex-1"
              >
                {canStartGame
                  ? '🎮 Iniciar Juego'
                  : 'Esperando jugadores activos...'}
              </button>
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-md pt-md border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md text-center text-sm">
              <div>
                <div className="text-muted">Jugadores</div>
                <div className="font-semibold">{lobby.players.length}/8</div>
              </div>
              <div>
                <div className="text-muted">Listos</div>
                <div className="font-semibold">
                  {lobby.players.filter((p: any) => p.isReady).length}
                </div>
              </div>
              <div>
                <div className="text-muted">Equipo Azul</div>
                <div className="font-semibold text-blue">{blueTeam.length}</div>
              </div>
              <div>
                <div className="text-muted">Equipo Rojo</div>
                <div className="font-semibold text-red">{redTeam.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Reglas del juego */}
        <div className="card mt-lg">
          <h3 className="font-semibold text-primary mb-md">
            📝 Reglas del Juego
          </h3>
          <div className="grid md:grid-cols-2 gap-md text-sm text-secondary">
            <div>
              <h4 className="font-medium mb-sm">Objetivo:</h4>
              <ul className="space-y-1">
                <li>Ganar puntos adivinando respuestas correctas</li>
                <li>Confundir a oponentes con respuestas falsas creíbles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-sm">Puntuación:</h4>
              <ul className="space-y-1">
                <li>+100 pts por respuesta correcta</li>
                <li>+50 pts por cada oponente confundido</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
