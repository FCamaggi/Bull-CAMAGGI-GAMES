import { useEffect, useState } from 'react';
import HomePage from '../pages/HomePage';
import LobbyPage from '../pages/LobbyPage';
import GamePage from '../pages/GamePage';
import ErrorBoundary from './ErrorBoundary';
import LoadingScreen from './LoadingScreen';
import ReconnectScreen from './ReconnectScreen';
import { useGame } from '../hooks/useGame';

export default function App() {
  const game = useGame();
  const [showReconnectScreen, setShowReconnectScreen] = useState(false);

  // Verificar si hay un juego guardado al inicializar
  useEffect(() => {
    const savedGame = game.getSavedGameState();
    if (savedGame && !game.lobby) {
      setShowReconnectScreen(true);
    }
  }, [game.lobby, game.getSavedGameState]);

  // Detectar desconexiones para mostrar la pantalla de reconexión
  useEffect(() => {
    if (!game.isConnected && game.lobby && !showReconnectScreen) {
      // Si estábamos en un juego y se perdió la conexión, mostrar reconexión
      const savedGame = game.getSavedGameState();
      if (savedGame) {
        setShowReconnectScreen(true);
      }
    }
  }, [game.isConnected, game.lobby, showReconnectScreen, game.getSavedGameState]);

  // Manejar reconexión
  const handleReconnect = (playerName: string, lobbyCode: string) => {
    game.reconnectByName(playerName, lobbyCode);
  };

  const handleCancelReconnect = () => {
    game.clearSavedGameState();
    setShowReconnectScreen(false);
  };

  // Si se está reconectando, ocultar la pantalla de reconexión después del éxito
  useEffect(() => {
    if (game.lobby && showReconnectScreen) {
      setShowReconnectScreen(false);
    }
  }, [game.lobby, showReconnectScreen]);

  // Mostrar pantalla de reconexión si es necesario
  if (showReconnectScreen) {
    const savedGame = game.getSavedGameState();
    return (
      <ErrorBoundary>
        <ReconnectScreen
          lastPlayerName={savedGame?.playerName || ''}
          lastLobbyCode={savedGame?.lobbyCode || ''}
          onReconnect={handleReconnect}
          onCancel={handleCancelReconnect}
        />
      </ErrorBoundary>
    );
  }

  // Mostrar pantalla de carga si no está conectado
  if (!game.isConnected) {
    return (
      <ErrorBoundary>
        <LoadingScreen />
      </ErrorBoundary>
    );
  }

  // Mostrar error si hay alguno
  if (game.error) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <div className="card max-w-md w-full text-center">
            <div className="text-6xl mb-lg">❌</div>
            <h1 className="text-2xl font-bold mb-md text-red-500">
              Error de Conexión
            </h1>
            <p className="text-secondary mb-lg">
              {game.error}
            </p>
            <button
              onClick={() => {
                game.clearError();
                game.connect();
              }}
              className="btn btn-primary w-full"
            >
              🔄 Reintentar
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  // Navegar según el estado actual
  const renderCurrentPage = () => {
    if (game.currentPage === 'game' && game.gameState) {
      return <GamePage game={game} />;
    }
    
    if (game.currentPage === 'lobby' && game.lobby) {
      return <LobbyPage game={game} />;
    }
    
    // Por defecto, mostrar la página de inicio
    return <HomePage game={game} />;
  };

  return (
    <ErrorBoundary>
      {renderCurrentPage()}
    </ErrorBoundary>
  );
}
