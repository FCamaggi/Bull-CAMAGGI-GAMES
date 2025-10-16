import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../types';

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>;

interface UseSocketOptions {
  url?: string;
  autoConnect?: boolean;
}

interface SocketState {
  socket: SocketType | null;
  connected: boolean;
  error: string | null;
}

/**
 * Hook personalizado para manejar conexiones Socket.io
 */
export function useSocket(options: UseSocketOptions = {}) {
  // Usar variable de entorno para la URL del backend
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  const { url = backendUrl, autoConnect = true } = options;

  console.log('🔌 Configuración de Socket:', {
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    backendUrl,
    url,
    mode: import.meta.env.MODE,
  });

  const [state, setState] = useState<SocketState>({
    socket: null,
    connected: false,
    error: null,
  });

  const socketRef = useRef<SocketType | null>(null);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log('🔌 Intentando conectar a:', url);

    try {
      const socket = io(url, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        timeout: 10000,
        retries: 3,
      }) as SocketType;

      // Event listeners para estado de conexión
      socket.on('connect', () => {
        console.log('✅ Conectado al servidor');
        setState((prev) => ({ ...prev, connected: true, error: null }));
      });

      socket.on('disconnect', (reason) => {
        console.log('❌ Desconectado del servidor:', reason);
        setState((prev) => ({ ...prev, connected: false }));
      });

      socket.on('connect_error', (error) => {
        console.error('❌ Error de conexión:', error);
        setState((prev) => ({
          ...prev,
          connected: false,
          error: `Error de conexión: ${error.message}`,
        }));
      });

      socketRef.current = socket;
      setState((prev) => ({ ...prev, socket }));

      socket.connect();
    } catch (error) {
      console.error('Error creando socket:', error);
      setState((prev) => ({
        ...prev,
        error: `Error creando conexión: ${error}`,
      }));
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setState((prev) => ({ ...prev, socket: null, connected: false }));
    }
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(connect, 1000);
  }, [connect, disconnect]);

  // Auto-conectar si está habilitado
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, connect]);

  // Métodos para emitir eventos comunes
  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(
      event: K,
      ...args: Parameters<ClientToServerEvents[K]>
    ) => {
      if (!state.socket || !state.connected) {
        console.warn(`Intentando emitir ${event} pero no hay conexión`);
        return;
      }

      state.socket.emit(event, ...args);
    },
    [state.socket, state.connected]
  );

  const on = useCallback(
    (event: string, listener: any) => {
      if (!state.socket) return;

      state.socket.on(event as any, listener);

      // Retornar función para remover listener
      return () => {
        state.socket?.off(event as any, listener);
      };
    },
    [state.socket]
  );

  const off = useCallback(
    (event: string, listener?: any) => {
      if (!state.socket) return;

      if (listener) {
        state.socket.off(event as any, listener);
      } else {
        state.socket.off(event as any);
      }
    },
    [state.socket]
  );

  return {
    ...state,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
  };
}
