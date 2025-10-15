import { useState, useEffect } from 'react';

interface ReconnectScreenProps {
  lastPlayerName?: string;
  lastLobbyCode?: string;
  onReconnect: (playerName: string, lobbyCode: string) => void;
  onCancel: () => void;
}

export default function ReconnectScreen({
  lastPlayerName = '',
  lastLobbyCode = '',
  onReconnect,
  onCancel,
}: ReconnectScreenProps) {
  const [playerName, setPlayerName] = useState(lastPlayerName);
  const [lobbyCode, setLobbyCode] = useState(lastLobbyCode);
  const [isReconnecting, setIsReconnecting] = useState(false);

  // Intentar reconexión automática si tenemos datos guardados
  useEffect(() => {
    if (lastPlayerName && lastLobbyCode && !isReconnecting) {
      setIsReconnecting(true);
      setTimeout(() => {
        onReconnect(lastPlayerName, lastLobbyCode);
        setTimeout(() => setIsReconnecting(false), 3000); // Reset después de 3 segundos
      }, 1000); // Esperar 1 segundo antes de intentar reconexión
    }
  }, [lastPlayerName, lastLobbyCode, onReconnect, isReconnecting]);

  const handleReconnect = () => {
    if (playerName.trim() && lobbyCode.trim()) {
      setIsReconnecting(true);
      onReconnect(playerName.trim(), lobbyCode.trim().toUpperCase());
      // Reset después de unos segundos si no funciona
      setTimeout(() => setIsReconnecting(false), 5000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="card max-w-md w-full text-center">
        <div className="text-6xl mb-lg">🔄</div>
        <h1 className="text-2xl font-bold mb-md text-accent">
          Reconectar al Juego
        </h1>

        {isReconnecting ? (
          <div className="space-y-md">
            <div className="spinner mx-auto"></div>
            <p className="text-secondary">Intentando reconectar...</p>
            <p className="text-sm text-muted">
              {lastPlayerName && lastLobbyCode
                ? `Reconectando como ${lastPlayerName} al lobby ${lastLobbyCode}`
                : 'Reconectando al juego...'}
            </p>
          </div>
        ) : (
          <div className="space-y-lg">
            <p className="text-secondary mb-lg">
              Se perdió la conexión. Ingresa tus datos para volver al juego.
            </p>

            <div className="form-group">
              <label htmlFor="playerName" className="form-label">
                Tu nombre:
              </label>
              <input
                id="playerName"
                type="text"
                className="input"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Ingresa tu nombre"
                maxLength={50}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lobbyCode" className="form-label">
                Código del lobby:
              </label>
              <input
                id="lobbyCode"
                type="text"
                className="input uppercase"
                value={lobbyCode}
                onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                maxLength={6}
              />
            </div>

            <div className="space-y-sm">
              <button
                onClick={handleReconnect}
                disabled={!playerName.trim() || !lobbyCode.trim()}
                className="btn btn-primary w-full"
              >
                🔄 Reconectar
              </button>
              <button onClick={onCancel} className="btn btn-secondary w-full">
                ❌ Cancelar
              </button>
            </div>

            {lastPlayerName && lastLobbyCode && (
              <div className="mt-md p-sm bg-accent/10 border border-accent/30 rounded text-sm">
                <p className="font-bold text-accent">💡 Tip:</p>
                <p className="text-secondary">
                  Se detectó que estabas jugando como{' '}
                  <strong>{lastPlayerName}</strong> en el lobby{' '}
                  <strong>{lastLobbyCode}</strong>. Si es correcto, solo
                  presiona "Reconectar".
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
