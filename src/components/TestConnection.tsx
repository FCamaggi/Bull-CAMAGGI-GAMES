import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export default function TestConnection() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev.slice(-10),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  useEffect(() => {
    addLog('Iniciando conexión...');

    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      addLog('✅ Conectado');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      addLog(`❌ Desconectado: ${reason}`);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      addLog(`❌ Error: ${error.message}`);
    });

    setSocket(newSocket);

    return () => {
      addLog('Limpiando conexión...');
      newSocket.disconnect();
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h2>Test de Conexión WebSocket</h2>
      <div>
        <strong>Estado:</strong>{' '}
        {connected ? '✅ Conectado' : '❌ Desconectado'}
      </div>
      <div>
        <strong>Socket ID:</strong> {socket?.id || 'N/A'}
      </div>

      <h3>Logs:</h3>
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '10px',
          maxHeight: '200px',
          overflowY: 'scroll',
          fontSize: '12px',
        }}
      >
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
