import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../types';
import { getBackendUrl, getBackendUrlSync } from '../utils/runtimeConfig';

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
  // Intentar usar runtime config, con fallback a import.meta.env
  const defaultBackendUrl = getBackendUrlSync();
  const { url = defaultBackendUrl, autoConnect = true } = options;

  const [backendUrl, setBackendUrl] = useState(url);
  const [configLoaded, setConfigLoaded] = useState(false);

  // Cargar runtime config al montar
  useEffect(() => {
    getBackendUrl()
      .then((runtimeUrl) => {
        if (runtimeUrl !== backendUrl) {
          console.log(
            '🔄 Actualizando backend URL desde runtime-config:',
            runtimeUrl
          );
          setBackendUrl(runtimeUrl);
        }
      })
      .finally(() => {
        setConfigLoaded(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Log de configuración solo cuando cambia algo relevante
  useEffect(() => {
    console.log('🔌 Configuración de Socket:', {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      backendUrl,
      url: backendUrl,
      mode: import.meta.env.MODE,
      configLoaded,
    });
  }, [backendUrl, configLoaded]); // Solo log cuando estos cambien

  const [state, setState] = useState<SocketState>({
    socket: null,
    connected: false,
    error: null,
  });

  const socketRef = useRef<SocketType | null>(null);
  const connectAttemptedRef = useRef(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return;

    console.log('🔌 Intentando conectar a:', backendUrl);

    try {
      const socket = io(backendUrl, {
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
  }, [backendUrl]);

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

  // Auto-conectar si está habilitado, pero solo después de cargar config
  useEffect(() => {
    if (autoConnect && configLoaded && !connectAttemptedRef.current) {
      connectAttemptedRef.current = true;
      connect();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [autoConnect, configLoaded, connect]);

  // Métodos para emitir eventos comunes
  const emit = useCallback(
    <K extends keyof ClientToServerEvents>(
      event: K,
      ...args: Parameters<ClientToServerEvents[K]>
    ) => {
      const socket = socketRef.current;
      
      console.log('🔥 emit llamado:', {
        event,
        hasSocket: !!socket,
        isConnected: socket?.connected,
        args
      });
      
      if (!socket || !socket.connected) {
        console.error(`❌ Intentando emitir ${event} pero no hay conexión`, {
          hasSocket: !!socket,
          isConnected: socket?.connected
        });
        return;
      }

      console.log('✅ Emitiendo evento:', event, args);
      
      // Intentar emitir de diferentes formas para debug
      socket.emit(event, ...args);
      
      // Log para confirmar que se emitió
      console.log('📤 Evento emitido al socket');
    },
    []
  );

  const on = useCallback(
    (event: string, listener: any) => {
      const socket = socketRef.current;
      if (!socket) {
        console.warn('No hay socket para agregar listener:', event);
        return;
      }

      socket.on(event as any, listener);

      // Retornar función para remover listener
      return () => {
        socketRef.current?.off(event as any, listener);
      };
    },
    []
  );

  const off = useCallback(
    (event: string, listener?: any) => {
      const socket = socketRef.current;
      if (!socket) return;

      if (listener) {
        socket.off(event as any, listener);
      } else {
        socket.off(event as any);
      }
    },
    []
  );

  return {
    socket: socketRef.current,
    connected: socketRef.current?.connected || false,
    error: state.error,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
  };
}
