import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import HomePage from '../pages/HomePage';
import LobbyPage from '../pages/LobbyPage';
import GamePage from '../pages/GamePage';
import ErrorBoundary from './ErrorBoundary';
import LoadingScreen from './LoadingScreen';
import HostLobbyView from './HostLobbyView';

export default function App() {
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [currentView, setCurrentView] = useState<
    'home' | 'host-lobby' | 'player-lobby' | 'game'
  >('home');
  const [currentLobby, setCurrentLobby] = useState<any>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    console.log('🔧 Iniciando conexión Socket.io...');

    // Usar variable de entorno o localhost por defecto
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    console.log('🔧 Conectando a:', backendUrl);

    const newSocket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      timeout: 10000,
    });

    newSocket.on('connect', () => {
      console.log('✅ Conectado al servidor');
      setConnected(true);
      setError(undefined);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('❌ Desconectado del servidor:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err);
      setError(`Error de conexión: ${err.message}`);
      setConnected(false);
    });

    // Escuchar cuando se crea un lobby
    newSocket.on('lobby_created', (data: any) => {
      console.log('🎉 Lobby creado exitosamente:', data);
      setCurrentLobby(data.lobby);
      setCurrentPlayerId(data.playerId);
      setIsHost(true);
      setCurrentView('host-lobby');
    });

    // Escuchar cuando se une a un lobby
    newSocket.on('lobby_joined', (data: any) => {
      console.log('🎉 Unido al lobby exitosamente:', data);
      setCurrentLobby(data.lobby);
      setCurrentPlayerId(data.playerId);
      setIsHost(false);
      setCurrentView('player-lobby');
    });

    // Debug - capturar TODOS los eventos del socket
    newSocket.onAny((eventName, ...args) => {
      console.log('📡 Evento recibido:', eventName, args);
    });

    // Debug - verificar eventos
    console.log('🔧 Eventos de socket configurados');

    // Escuchar actualizaciones del lobby
    newSocket.on('lobby_updated', (data: any) => {
      console.log('🔄 Lobby actualizado:', data);
      setCurrentLobby(data.lobby);
    });

    newSocket.on('team_updated', (data: any) => {
      console.log('👥 Equipos actualizados:', data);
      // El lobby_updated ya maneja esto, pero lo dejamos por compatibilidad
    });

    // Escuchar cuando inicia el juego
    newSocket.on('game_started', (data: any) => {
      console.log('🎮 Juego iniciado:', data);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: data.gameState,
        status: 'playing',
      }));
      setCurrentView('game');
    });

    // Escuchar eventos de las rondas del juego
    newSocket.on('round_started', (data: any) => {
      console.log('🎯 Ronda iniciada:', data);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          ...data.gameState,
          currentRoundData: data.roundData,
        },
      }));
    });

    newSocket.on('writing_phase', (data: any) => {
      console.log('✍️ Fase de escritura:', data);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          status: 'answering',
          timeLeft: data.timeLeft,
          currentRoundData: data.roundData,
        },
      }));
    });

    newSocket.on('voting_phase', (data: any) => {
      console.log('🗳️ Fase de votación:', data);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          phase: 'voting',
          timeLeft: data.timeLeft,
          currentRoundData: data.roundData,
          options: data.options,
        },
      }));
    });

    newSocket.on('round_results', (data: any) => {
      console.log('📊 Resultados de ronda:', data);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: {
          ...prev.gameState,
          phase: 'results',
          currentRoundData: data.roundData,
          scores: data.results?.newScores || prev.gameState.scores,
          results: data.results,
          options: data.options,
          votes: data.votes,
        },
      }));
    });

    newSocket.on('game_state_updated', (data: any) => {
      console.log('🔄 Estado del juego actualizado:', data);
      console.log('🔍 gameState completo:', data.gameState);
      setCurrentLobby((prev: any) => ({
        ...prev,
        gameState: data.gameState, // Reemplazar completamente el gameState
      }));
    });

    // Escuchar errores del servidor
    newSocket.on('error', (data: any) => {
      console.error('❌ Error del servidor:', data);
      setError(data.message);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔧 Limpiando conexión...');
      newSocket.disconnect();
    };
  }, []);

  // Mostrar pantalla de carga mientras se conecta
  if (!connected && !error) {
    return <LoadingScreen message="Conectando al servidor..." />;
  }

  // Mostrar error de conexión
  if (error && !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="card text-center max-w-md">
          <h2 className="text-2xl font-bold text-error mb-md">
            Error de Conexión
          </h2>
          <p className="text-secondary mb-lg">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Crear un objeto game completo para compatibilidad
  const game = {
    connected,
    socket,
    error,
    lobby: currentLobby,
    playerId: currentPlayerId,
    isHost,
    currentPlayer: currentLobby?.players?.find(
      (p: any) => p.id === currentPlayerId
    ),
    createLobby: (playerName: string) => {
      if (socket && connected) {
        console.log('🎯 Creando lobby para:', playerName);
        socket.emit('create_lobby', { playerName });
      }
    },
    joinLobby: (playerName: string, code: string) => {
      if (socket && connected) {
        const normalizedCode = code.toUpperCase().trim();
        console.log('🎯 Uniéndose al lobby:', {
          playerName,
          code: normalizedCode,
        });
        socket.emit('join_lobby', { code: normalizedCode, playerName });
      }
    },
    selectTeam: (team: 'blue' | 'red') => {
      if (socket && connected) {
        socket.emit('select_team', { team });
      }
    },
    toggleReady: () => {
      if (socket && connected) {
        socket.emit('ready_toggle');
      }
    },
    startGame: () => {
      if (socket && connected && isHost) {
        socket.emit('start_game', {});
      }
    },
    leaveLobby: () => {
      if (socket && connected) {
        socket.emit('leave_lobby');
        setCurrentView('home');
        setCurrentLobby(null);
        setIsHost(false);
      }
    },
  };

  // Renderizar vista según el estado actual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'host-lobby':
        return <HostLobbyView lobby={currentLobby} socket={socket} />;
      case 'player-lobby':
        return <LobbyPage game={game} />;
      case 'game':
        return <GamePage game={game} />;
      default:
        return <HomePage game={game} />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-primary">
        {renderCurrentView()}

        {/* Connection status indicator */}
        {!connected && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-warning text-white px-md py-sm rounded-lg text-sm">
              Reconectando...
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
