import { useState } from 'react';

interface HomePageProps {
  game: any; // Usamos any por ahora para evitar errores de tipos
}

export default function HomePage({ game }: HomePageProps) {
  const [playerName, setPlayerName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateLobby = async () => {
    if (!playerName.trim()) return;

    setIsCreating(true);
    try {
      game.createLobby(playerName.trim());
    } catch (error) {
      console.error('Error creando lobby:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async () => {
    if (!playerName.trim() || !lobbyCode.trim()) return;

    setIsJoining(true);
    try {
      game.joinLobby(playerName.trim(), lobbyCode.trim().toUpperCase());
    } catch (error) {
      console.error('Error uniéndose al lobby:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-lg">
          <h1 className="text-4xl font-bold mb-sm">🎯 BULL</h1>
          <p className="text-lg text-secondary">
            El juego de trivia donde confundir es ganar
          </p>
        </div>

        {/* Main Card */}
        <div className="card">
          <div className="text-center mb-lg">
            <h2 className="text-2xl font-bold text-accent mb-sm">
              ¡Empezar a Jugar!
            </h2>
            <p className="text-secondary">Ingresa tu nombre para continuar</p>
          </div>

          {/* Nombre del jugador */}
          <div className="mb-md">
            <label className="block font-medium text-secondary mb-sm">
              Tu nombre
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="input"
              placeholder="Escribe tu nombre..."
              maxLength={50}
            />
          </div>

          {/* Crear lobby */}
          <div className="mb-md">
            <button
              onClick={handleCreateLobby}
              disabled={!playerName.trim() || isCreating || !game.connected}
              className="btn btn-primary btn-mobile"
            >
              {isCreating ? (
                <>
                  <div className="spinner"></div>
                  <span>Creando...</span>
                </>
              ) : (
                <>
                  <span>🎮</span>
                  <span>Crear Partida</span>
                </>
              )}
            </button>
          </div>

          {/* Separador */}
          <div className="flex items-center my-md">
            <div className="flex-1 border-t border-border-color"></div>
            <span className="px-md text-muted text-sm">O</span>
            <div className="flex-1 border-t border-border-color"></div>
          </div>

          {/* Unirse a lobby */}
          <div className="mb-md">
            <label className="block font-medium text-secondary mb-sm">
              Código de partida
            </label>
            <input
              type="text"
              value={lobbyCode}
              onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
              className="input code-input"
              placeholder="ABC123"
              maxLength={6}
            />
          </div>

          <div className="mb-md">
            <button
              onClick={handleJoinLobby}
              disabled={
                !playerName.trim() ||
                !lobbyCode.trim() ||
                isJoining ||
                !game.connected
              }
              className="btn btn-blue btn-mobile"
            >
              {isJoining ? (
                <>
                  <div className="spinner"></div>
                  <span>Conectando...</span>
                </>
              ) : (
                <>
                  <span>🚪</span>
                  <span>Unirse a Partida</span>
                </>
              )}
            </button>
          </div>

          {/* Estado de conexión */}
          {!game.connected && (
            <div className="text-center p-sm bg-warning bg-opacity-10 rounded-lg border border-warning">
              <span className="text-warning text-sm font-medium">
                ⚠️ Conectando al servidor...
              </span>
            </div>
          )}
        </div>

        {/* Instrucciones */}
        <div className="card mt-md">
          <h3 className="font-bold text-accent mb-md text-center">
            ¿Cómo Jugar?
          </h3>
          <div className="space-y-sm text-sm text-secondary">
            <div className="flex items-start gap-sm">
              <span className="font-bold text-accent">1.</span>
              <p>Elige equipo (Azul 🔵 o Rojo 🔴)</p>
            </div>
            <div className="flex items-start gap-sm">
              <span className="font-bold text-accent">2.</span>
              <p>Escribe respuestas falsas convincentes</p>
            </div>
            <div className="flex items-start gap-sm">
              <span className="font-bold text-accent">3.</span>
              <p>Vota por la respuesta correcta</p>
            </div>
            <div className="flex items-start gap-sm">
              <span className="font-bold text-accent">4.</span>
              <p>Gana puntos (+100 correctas, +150 confundiendo)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
