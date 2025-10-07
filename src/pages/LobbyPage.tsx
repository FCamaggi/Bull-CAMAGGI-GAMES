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
          {/* Equipo Azul */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-xl font-bold text-blue">🔵 Equipo Azul</h2>
              <span className="text-sm text-muted">{blueTeam.length}/4</span>
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
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {player.name}
                      {player.isHost && ' 👑'}
                      {player.id === playerId && ' (TÚ)'}
                    </span>
                    <div className="flex items-center gap-sm">
                      <span className="text-sm text-muted">
                        {player.score} pts
                      </span>
                      {player.isReady && (
                        <span className="text-success">✓</span>
                      )}
                      {!player.isConnected && (
                        <span className="text-error">⚠️</span>
                      )}
                    </div>
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
              disabled={blueTeam.length >= 4 || currentPlayer?.team === 'blue'}
              className="btn btn-blue w-full"
            >
              {currentPlayer?.team === 'blue'
                ? 'En Equipo Azul'
                : 'Unirse al Azul'}
            </button>
          </div>

          {/* Equipo Rojo */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h2 className="text-xl font-bold text-red">🔴 Equipo Rojo</h2>
              <span className="text-sm text-muted">{redTeam.length}/4</span>
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
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {player.name}
                      {player.isHost && ' 👑'}
                      {player.id === playerId && ' (TÚ)'}
                    </span>
                    <div className="flex items-center gap-sm">
                      <span className="text-sm text-muted">
                        {player.score} pts
                      </span>
                      {player.isReady && (
                        <span className="text-success">✓</span>
                      )}
                      {!player.isConnected && (
                        <span className="text-error">⚠️</span>
                      )}
                    </div>
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
              disabled={redTeam.length >= 4 || currentPlayer?.team === 'red'}
              className="btn btn-red w-full"
            >
              {currentPlayer?.team === 'red'
                ? 'En Equipo Rojo'
                : 'Unirse al Rojo'}
            </button>
          </div>
        </div>

        {/* Controles */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-md items-center">
            {/* Ready toggle */}
            {currentPlayer?.team && (
              <button
                onClick={handleToggleReady}
                className={`btn ${
                  currentPlayer.isReady ? 'btn-success' : 'btn-secondary'
                } flex-1`}
              >
                {currentPlayer.isReady ? '✓ Listo' : 'Marcar como Listo'}
              </button>
            )}

            {/* Start game (solo host) */}
            {isHost && (
              <button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="btn btn-primary flex-1"
              >
                {canStartGame ? '🎮 Iniciar Juego' : 'Esperando jugadores...'}
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
