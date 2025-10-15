import { useState, useCallback, useEffect, useMemo } from 'react';
import { useSocket } from './useSocket';
import {
  AppState,
  GameSettings,
  RoundOption,
  RoundResult,
  ServerToClientEvents,
} from '../types';

interface GameData {
  timeRemaining: number;
  currentOptions: RoundOption[];
  lastResults: RoundResult | null;
}

const initialAppState: AppState = {
  currentPage: 'home',
  lobby: undefined,
  gameState: undefined,
  playerId: undefined,
  playerName: undefined,
  error: undefined,
  isConnected: false,
};

const initialGameData: GameData = {
  timeRemaining: 0,
  currentOptions: [],
  lastResults: null,
};

// Funciones de persistencia local
const saveGameState = (
  playerName: string,
  lobbyCode: string,
  playerId: string
) => {
  try {
    const gameData = {
      playerName,
      lobbyCode,
      playerId,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('bull-game-state', JSON.stringify(gameData));
  } catch (error) {
    console.warn('No se pudo guardar el estado del juego:', error);
  }
};

const loadGameState = () => {
  try {
    const saved = localStorage.getItem('bull-game-state');
    if (saved) {
      const data = JSON.parse(saved);
      // Solo usar si es reciente (menos de 1 hora)
      const timestamp = new Date(data.timestamp);
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      if (timestamp > hourAgo) {
        return data;
      }
    }
  } catch (error) {
    console.warn('No se pudo cargar el estado del juego:', error);
  }
  return null;
};

const clearGameState = () => {
  try {
    localStorage.removeItem('bull-game-state');
  } catch (error) {
    console.warn('No se pudo limpiar el estado del juego:', error);
  }
};

export const useGame = () => {
  const [appState, setAppState] = useState<AppState>(initialAppState);
  const [gameData, setGameData] = useState<GameData>(initialGameData);

  const { socket, connected, error: socketError, emit, on } = useSocket();

  // Actualizar estado de conexión
  useEffect(() => {
    setAppState((prev) => ({ ...prev, isConnected: connected }));
  }, [connected]);

  // Configurar listeners cuando hay conexión
  useEffect(() => {
    if (!connected) return;

    const unsubscribers: (() => void)[] = [];

    // Helper para agregar listeners de forma segura
    const addListener = <K extends keyof ServerToClientEvents>(
      event: K,
      handler: ServerToClientEvents[K]
    ) => {
      const unsubscribe = on(event, handler);
      if (unsubscribe) unsubscribers.push(unsubscribe);
    };

    addListener('lobby_created', ({ lobby, playerId }) => {
      console.log('Lobby creado:', lobby.code);
      // Guardar estado para reconexión
      if (appState.playerName) {
        saveGameState(appState.playerName, lobby.code, playerId);
      }
      setAppState((prev) => ({
        ...prev,
        currentPage: 'lobby',
        lobby,
        playerId,
        error: undefined,
      }));
    });

    addListener('lobby_joined', ({ lobby, playerId }) => {
      console.log('Unido al lobby:', lobby.code);
      // Guardar estado para reconexión
      if (appState.playerName) {
        saveGameState(appState.playerName, lobby.code, playerId);
      }
      setAppState((prev) => ({
        ...prev,
        currentPage: 'lobby',
        lobby,
        playerId,
        error: undefined,
      }));
    });

    addListener('lobby_updated', ({ lobby }) => {
      setAppState((prev) => ({ ...prev, lobby }));
    });

    addListener('player_joined', ({ player }) => {
      console.log('Jugador se unió:', player.name);
    });

    addListener('player_left', ({ playerId: leftPlayerId }) => {
      console.log('Jugador se fue:', leftPlayerId);
    });

    addListener('team_updated', ({ teams }) => {
      setAppState((prev) => ({
        ...prev,
        lobby: prev.lobby ? { ...prev.lobby, teams } : undefined,
      }));
    });

    addListener('game_started', ({ gameState }) => {
      console.log('Juego iniciado');
      setAppState((prev) => ({
        ...prev,
        currentPage: 'game',
        gameState,
      }));
    });

    addListener('game_state_updated', ({ gameState }) => {
      setAppState((prev) => ({ ...prev, gameState }));
    });

    addListener('round_started', ({ round, timeRemaining }) => {
      console.log('Ronda iniciada:', round.number);
      setGameData((prev) => ({ ...prev, timeRemaining }));
    });

    addListener('writing_phase', ({ timeRemaining }) => {
      console.log('Fase de escritura');
      setGameData((prev) => ({ ...prev, timeRemaining }));
    });

    addListener('voting_phase', ({ options, timeRemaining }) => {
      console.log('Fase de votación');
      setGameData((prev) => ({
        ...prev,
        currentOptions: options,
        timeRemaining,
      }));
    });

    addListener('round_results', ({ results }) => {
      console.log('Resultados de ronda:', results.roundNumber);
      setGameData((prev) => ({
        ...prev,
        lastResults: results,
      }));
    });

    addListener('time_update', ({ timeRemaining }) => {
      setGameData((prev) => ({ ...prev, timeRemaining }));
    });

    addListener('game_finished', ({ winner, finalScores }) => {
      console.log('Juego terminado. Ganador:', winner);
      setAppState((prev) => ({
        ...prev,
        gameState: prev.gameState
          ? {
              ...prev.gameState,
              phase: 'finished',
              winner,
              scores: finalScores,
            }
          : undefined,
      }));
    });

    addListener('error', ({ message, code }) => {
      console.error('Error del servidor:', message, code);
      setAppState((prev) => ({ ...prev, error: message }));
    });

    addListener('validation_error', ({ field, message }) => {
      console.error('Error de validación:', field, message);
      setAppState((prev) => ({ ...prev, error: `${field}: ${message}` }));
    });

    addListener('reconnected', ({ lobby, gameState, playerId }) => {
      console.log('Reconectado exitosamente:', lobby?.code);
      setAppState((prev) => ({
        ...prev,
        currentPage: lobby?.gameState ? 'game' : 'lobby',
        lobby,
        gameState,
        playerId: playerId || prev.playerId,
        error: undefined,
      }));
    });

    addListener('player_reconnected', ({ playerName }) => {
      console.log(`Jugador ${playerName} se reconectó`);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [connected, on]);

  // Actions
  const actions = {
    connect: useCallback(() => {
      if (socket) {
        socket.connect();
      }
    }, [socket]),

    disconnect: useCallback(() => {
      if (socket) {
        socket.disconnect();
      }
    }, [socket]),

    createLobby: useCallback(
      (playerName: string) => {
        setAppState((prev) => ({ ...prev, playerName }));
        emit('create_lobby', { playerName });
      },
      [emit]
    ),

    joinLobby: useCallback(
      (playerName: string, lobbyCode: string) => {
        setAppState((prev) => ({ ...prev, playerName }));
        emit('join_lobby', { code: lobbyCode.toUpperCase(), playerName });
      },
      [emit]
    ),

    leaveLobby: useCallback(() => {
      emit('leave_lobby');
      clearGameState(); // Limpiar estado guardado
      setAppState(initialAppState);
      setGameData(initialGameData);
    }, [emit]),

    selectTeam: useCallback(
      (team: 'blue' | 'red') => {
        emit('select_team', { team });
      },
      [emit]
    ),

    toggleReady: useCallback(() => {
      emit('ready_toggle');
    }, [emit]),

    startGame: useCallback(
      (settings?: Partial<GameSettings>) => {
        emit('start_game', settings);
      },
      [emit]
    ),

    submitAnswer: useCallback(
      (answer: string) => {
        emit('submit_answer', { answer });
      },
      [emit]
    ),

    submitVote: useCallback(
      (optionId: string) => {
        emit('submit_vote', { optionId });
      },
      [emit]
    ),

    nextRound: useCallback(() => {
      emit('next_phase');
    }, [emit]),

    restartGame: useCallback(() => {
      emit('reset_game');
    }, [emit]),

    clearError: useCallback(() => {
      setAppState((prev) => ({ ...prev, error: undefined }));
    }, []),

    // Funciones de reconexión
    reconnectByName: useCallback(
      (playerName: string, lobbyCode: string) => {
        emit('reconnect_by_name', { playerName, lobbyCode });
      },
      [emit]
    ),

    reconnectById: useCallback(
      (playerId: string, lobbyCode: string) => {
        emit('reconnect_attempt', { playerId, lobbyCode });
      },
      [emit]
    ),

    // Funciones de estado persistente
    getSavedGameState: useCallback(() => {
      return loadGameState();
    }, []),

    clearSavedGameState: useCallback(() => {
      clearGameState();
    }, []),
  };

  // Computed values
  const isHost = appState.lobby?.hostId === appState.playerId;
  const currentPlayer = appState.lobby?.players.find(
    (p) => p.id === appState.playerId
  );

  const canStartGame = useMemo(() => {
    if (!appState.lobby || !isHost) return false;
    if (appState.lobby.status !== 'waiting') return false;
    if (
      appState.lobby.teams.blue.length === 0 ||
      appState.lobby.teams.red.length === 0
    )
      return false;
    return appState.lobby.players.every((p) => p.isReady);
  }, [appState.lobby, isHost]);

  const computed = {
    isHost,
    currentPlayer,
    canStartGame,
    gamePhase: appState.gameState?.phase,
    currentRound: appState.gameState?.currentRound,
    totalRounds: appState.gameState?.totalRounds,
    scores: appState.gameState?.scores,
    isGameActive:
      appState.gameState?.phase &&
      !['waiting', 'finished'].includes(appState.gameState.phase),
  };

  return {
    // State
    ...appState,
    ...gameData,
    ...computed,
    isConnected: connected,
    connectionError: socketError,

    // Actions
    ...actions,
  };
};
