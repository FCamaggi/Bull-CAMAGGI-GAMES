import { useState, useEffect, useMemo } from 'react';
import HostControlPanel from '../components/HostControlPanel';
import { useAnswerValidation } from '../hooks/useValidation';
import type { BullRound } from '../types';

interface GamePageProps {
  game: any;
}

export default function GamePage({ game }: GamePageProps) {
  const { lobby, socket, isHost, currentPlayer } = game;
  const gameState = lobby?.gameState;
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [confirmedVote, setConfirmedVote] = useState(false);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Obtener la ronda actual para validaciones
  const currentRound = useMemo(() => {
    return gameState?.rounds?.find(
      (r: BullRound) => r.number === gameState?.currentRound
    );
  }, [gameState]);

  // Hook de validación para respuestas
  const validateAnswer = useAnswerValidation(currentRound);

  console.log('🎮 GamePage render:', {
    gameState: gameState?.phase,
    currentPlayer: currentPlayer?.name,
    isHost,
    playerId: game.playerId,
    hostId: lobby?.hostId,
    comparison: lobby?.hostId === game.playerId,
    currentRound: gameState?.currentRound,
    totalRounds: gameState?.rounds?.length,
    hasSelectedPlayers: !!gameState?.rounds?.find(
      (r: BullRound) => r.number === gameState?.currentRound
    )?.selectedPlayers,
  });

  // Resetear estados cuando cambie la ronda
  useEffect(() => {
    setHasSubmittedAnswer(false);
    setIsReady(false);
    setSelectedVote(null);
    setConfirmedVote(false);
    setCurrentAnswer('');
    setValidationError(null);
  }, [gameState?.currentRound]);

  // Validar respuesta en tiempo real cuando cambia
  useEffect(() => {
    if (currentAnswer.trim().length > 0) {
      const validation = validateAnswer(currentAnswer);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Error de validación');
      } else {
        setValidationError(null);
      }
    } else {
      setValidationError(null);
    }
  }, [currentAnswer, validateAnswer]);

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="card text-center">
          <h2 className="text-2xl font-bold mb-lg text-accent">
            Cargando juego...
          </h2>
          <div className="spinner mx-auto"></div>
        </div>
      </div>
    );
  }

  const renderGameContent = () => {
    const currentRound = gameState.rounds?.find(
      (r: any) => r.number === gameState?.currentRound
    );

    // Helper functions for results
    const getResponseStyle = (option: any) => {
      if (option.origin?.type === 'correct') {
        return 'option-correct';
      }
      if (option.origin?.type === 'player') {
        const allPlayers = [
          ...(lobby.teams?.blue || []),
          ...(lobby.teams?.red || []),
        ];
        const player = allPlayers.find(
          (p: any) => p.id === option.origin.playerId
        );
        if (player?.team === 'blue') {
          return 'option-team-blue';
        }
        if (player?.team === 'red') {
          return 'option-team-red';
        }
      }
      return 'bg-gray-100 border-gray-400 text-gray-800';
    };

    const getVoterDot = (voterId: string) => {
      const voter = [
        ...(lobby.teams?.blue || []),
        ...(lobby.teams?.red || []),
      ].find((p: any) => p.id === voterId);
      if (voter?.team === 'blue') {
        return 'team-blue';
      }
      if (voter?.team === 'red') {
        return 'team-red';
      }
      return '';
    };

    const getVotersForOption = (optionId: string) => {
      // Los votos están en currentRound.votes como { [playerId]: optionId }
      if (!currentRound?.votes) return [];
      return Object.entries(currentRound.votes)
        .filter(
          ([_, votedOptionId]: [string, any]) => votedOptionId === optionId
        )
        .map(([voterId]) => voterId);
    };

    switch (gameState.phase) {
      case 'waiting':
        return (
          <div className="min-h-screen flex items-center">
            <div className="container">
              <div className="game-header mb-md">
                <h1 className="text-xl font-bold">🎯 Bull Game</h1>
                <p className="text-sm opacity-90">
                  Ronda {gameState.currentRound} de{' '}
                  {lobby?.settings?.maxRounds || 'N/A'}
                </p>
              </div>

              <div className="card text-center">
                <h2 className="text-xl font-bold mb-md text-accent">
                  🏁 Esperando inicio de ronda
                </h2>
                {isHost ? (
                  <div>
                    <p className="text-secondary mb-md">
                      Usa el Panel de Control para iniciar la Ronda{' '}
                      {gameState.currentRound}
                    </p>
                    <div className="pulse text-accent text-sm">
                      <span>⚡ Listo para continuar</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-secondary mb-md">
                      El host iniciará la siguiente ronda...
                    </p>
                    <div className="spinner mx-auto"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'writing':
        const isActivePlayer =
          currentRound?.selectedPlayers?.blue?.id === currentPlayer?.id ||
          currentRound?.selectedPlayers?.red?.id === currentPlayer?.id;

        return (
          <div className="min-h-screen flex items-center">
            <div className="container">
              <div className="game-header mb-md">
                <h1 className="text-xl font-bold">📝 Fase de Escritura</h1>
                <p className="text-sm opacity-90">
                  Ronda {gameState.currentRound}
                </p>
              </div>

              <div className="card">
                <div className="game-header mb-md">
                  <p className="text-base font-semibold">
                    {currentRound?.question}
                  </p>
                </div>

                {isHost ? (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-lg text-accent">
                      🖥️ Vista del Host
                    </h2>
                    <p className="text-lg text-secondary mb-xl">
                      Los jugadores seleccionados están escribiendo sus
                      respuestas...
                    </p>

                    <div className="grid md:grid-cols-2 gap-lg">
                      <div className="team-indicator team-blue">
                        <span className="text-2xl">🔵</span>
                        <div>
                          <h3 className="font-bold">
                            {currentRound?.selectedPlayers?.blue?.name}
                          </h3>
                          <p className="text-sm">
                            {currentRound?.playerAnswers?.[
                              currentRound.selectedPlayers.blue.id
                            ]
                              ? '✅ Respuesta enviada'
                              : '⏳ Escribiendo...'}
                          </p>
                        </div>
                      </div>

                      <div className="team-indicator team-red">
                        <span className="text-2xl">🔴</span>
                        <div>
                          <h3 className="font-bold">
                            {currentRound?.selectedPlayers?.red?.name}
                          </h3>
                          <p className="text-sm">
                            {currentRound?.playerAnswers?.[
                              currentRound.selectedPlayers.red.id
                            ]
                              ? '✅ Respuesta enviada'
                              : '⏳ Escribiendo...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isActivePlayer ? (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-lg text-accent">
                      ✍️ Tu turno de escribir
                    </h2>
                    <p className="text-lg text-secondary mb-xl">
                      Escribe una respuesta convincente para confundir a los
                      otros jugadores
                    </p>

                    {!hasSubmittedAnswer ? (
                      <div className="space-y-lg">
                        {/* Formato sugerido */}
                        {currentRound?.suggestedFormat && (
                          <div className="bg-blue-600/10 border border-blue-600/30 rounded p-sm text-left mb-md">
                            <div className="text-sm font-bold text-blue-600 mb-xs">
                              � Formato sugerido:
                            </div>
                            <p className="text-sm text-secondary">
                              {currentRound.suggestedFormat}
                            </p>
                          </div>
                        )}

                        {/* Consejos */}
                        <div className="bg-accent/10 border border-accent/30 rounded p-sm text-left">
                          <div className="text-sm font-bold text-accent mb-xs">
                            💡 Consejos:
                          </div>
                          <ul className="text-xs text-secondary space-y-xs">
                            <li>
                              ✓ <strong>Sé convincente</strong> - Intenta que
                              suene como la respuesta correcta
                            </li>
                            <li>
                              ⚠️ <strong>No copies las respuestas</strong> - Tu
                              respuesta no puede ser igual a la correcta o
                              incorrecta
                            </li>
                            <li>
                              ✓ <strong>Sigue el formato</strong> - Respeta el
                              estilo sugerido arriba
                            </li>
                          </ul>
                        </div>

                        <div>
                          <label className="block text-lg font-medium mb-md text-left">
                            Tu respuesta:
                          </label>
                          <input
                            type="text"
                            className="input"
                            value={currentAnswer}
                            onChange={(e) => setCurrentAnswer(e.target.value)}
                            placeholder="Escribe una respuesta convincente..."
                            maxLength={120}
                          />
                          <p className="text-sm text-muted mt-sm text-right">
                            {currentAnswer.length}/120 caracteres
                          </p>
                        </div>

                        {/* Mostrar error de validación si existe */}
                        {validationError && (
                          <div className="bg-red-600/10 border border-red-600/30 rounded p-sm mb-md">
                            <div className="text-sm font-bold text-red-600 mb-xs">
                              ⚠️ Error:
                            </div>
                            <p className="text-red-600 text-sm">
                              {validationError}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            const validation = validateAnswer(currentAnswer);
                            if (!validation.isValid) {
                              setValidationError(
                                validation.error || 'Error de validación'
                              );
                              return;
                            }

                            socket.emit('submit_answer', {
                              answer: currentAnswer.trim(),
                            });
                            setHasSubmittedAnswer(true);
                          }}
                          disabled={!currentAnswer.trim() || !!validationError}
                          className="btn btn-primary btn-mobile"
                        >
                          📤 Enviar Respuesta
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-6xl mb-lg">✅</div>
                        <h3 className="text-xl font-bold text-success mb-md">
                          ¡Respuesta enviada!
                        </h3>
                        <p className="text-secondary">
                          Espera a que el otro jugador termine...
                        </p>

                        {!isReady && (
                          <button
                            onClick={() => {
                              socket.emit('mark_ready');
                              setIsReady(true);
                            }}
                            className="btn btn-success btn-mobile mt-lg"
                          >
                            ✓ Marcar como Listo
                          </button>
                        )}

                        {isReady && (
                          <div className="mt-lg">
                            <p className="text-success font-bold">
                              ✓ Marcado como listo
                            </p>
                            <div className="spinner mx-auto mt-md"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-xl font-bold mb-md text-accent">
                      👀{' '}
                      {currentPlayer?.role === 'spectator'
                        ? 'Público'
                        : 'Esperando'}
                    </h2>
                    <p className="text-secondary mb-md">
                      Los jugadores{' '}
                      <span className="font-semibold">
                        {currentRound?.selectedPlayers?.blue?.name}
                      </span>{' '}
                      (🔵) y{' '}
                      <span className="font-semibold">
                        {currentRound?.selectedPlayers?.red?.name}
                      </span>{' '}
                      (🔴) están escribiendo
                    </p>
                    <div className="spinner mx-auto"></div>
                    <p className="text-muted mt-sm text-sm">
                      {currentPlayer?.role === 'spectator'
                        ? '🗳️ Prepárate para votar en la siguiente fase'
                        : 'Prepárate para votar en la siguiente fase'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'voting':
        const canVote = currentPlayer && !isHost;

        return (
          <div className="min-h-screen flex items-center">
            <div className="container">
              <div className="game-header mb-md">
                <h1 className="text-xl font-bold">🗳️ Fase de Votación</h1>
                <p className="text-sm opacity-90">
                  ¿Cuál es la respuesta correcta?
                </p>
              </div>

              <div className="card">
                <div className="game-header mb-md">
                  <p className="text-base font-semibold">
                    {currentRound?.question}
                  </p>
                </div>

                {isHost ? (
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-md text-accent">
                      🖥️ Vista del Host - Votación
                    </h2>
                    <p className="text-secondary mb-md">
                      Los jugadores están votando...
                    </p>
                    <div className="spinner mx-auto"></div>
                  </div>
                ) : canVote ? (
                  <div>
                    <h2 className="text-lg font-bold mb-md text-accent text-center">
                      🤔 ¿Cuál crees que es la correcta?
                    </h2>

                    {!confirmedVote ? (
                      <>
                        <p className="text-sm text-muted text-center mb-md">
                          Toca una opción para seleccionarla, luego confirma tu
                          voto
                        </p>
                        <div className="space-y-sm">
                          {(gameState.options || currentRound?.options)?.map(
                            (option: any, index: number) => {
                              const isPreSelected = selectedVote === option.id;
                              return (
                                <div
                                  key={option.id || index}
                                  onClick={() => {
                                    if (!confirmedVote) {
                                      setSelectedVote(option.id);
                                    }
                                  }}
                                  className={`option-card cursor-pointer transition-all ${
                                    isPreSelected
                                      ? 'ring-2 ring-accent bg-accent/10'
                                      : ''
                                  }`}
                                >
                                  <div className="flex items-start gap-sm">
                                    <div className="flex-shrink-0 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-base">{option.text}</p>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>

                        {selectedVote && (
                          <div className="mt-md">
                            <button
                              onClick={() => {
                                socket.emit('submit_vote', {
                                  optionId: selectedVote,
                                });
                                setConfirmedVote(true);
                              }}
                              className="btn btn-primary w-full"
                            >
                              ✅ Confirmar Voto
                            </button>
                            <button
                              onClick={() => setSelectedVote(null)}
                              className="btn btn-secondary w-full mt-sm"
                            >
                              ↩️ Cambiar Selección
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center mt-md">
                        <div className="text-2xl mb-sm">✅</div>
                        <p className="font-bold text-success">
                          ¡Voto registrado!
                        </p>
                        <p className="text-secondary text-sm">
                          Esperando a los demás jugadores...
                        </p>
                        <div className="spinner mx-auto mt-sm"></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-lg font-bold mb-md text-accent">
                      ⏳ Esperando votación...
                    </h2>
                    <p className="text-secondary text-sm">
                      Conectándose al servidor...
                    </p>
                    <div className="spinner mx-auto mt-sm"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'results':
        return (
          <div className="min-h-screen flex items-center">
            <div className="container">
              <div className="game-header mb-md">
                <h1 className="text-xl font-bold">🏆 Resultados</h1>
                <p className="text-sm opacity-90">
                  Ronda {gameState.currentRound}
                </p>
              </div>

              <div className="card">
                <h2 className="text-lg font-bold mb-md text-center text-accent">
                  📊 Resultados de la Ronda
                </h2>

                <div className="game-header mb-md">
                  <p className="text-base font-semibold">
                    {currentRound?.question}
                  </p>
                </div>

                <div className="space-y-sm mb-md">
                  {(gameState.options || currentRound?.options)?.map(
                    (option: any, index: number) => {
                      const voters = getVotersForOption(option.id);
                      const isCorrect = option.origin?.type === 'correct';

                      return (
                        <div
                          key={option.id || index}
                          className={`option-card ${getResponseStyle(option)} ${
                            isCorrect ? 'ring-2 ring-green-400' : ''
                          }`}
                        >
                          <div className="flex items-start gap-sm mb-sm">
                            <div className="flex-shrink-0 w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-base font-semibold">
                                {option.text}
                              </p>
                              {isCorrect && (
                                <span className="inline-block px-sm py-xs bg-green-500 text-white text-xs rounded-full font-bold mt-xs">
                                  ✓ CORRECTA
                                </span>
                              )}
                              {option.origin?.type === 'player' && (
                                <p className="text-sm opacity-80 mt-sm">
                                  Respuesta de{' '}
                                  {
                                    [
                                      ...(lobby.teams?.blue || []),
                                      ...(lobby.teams?.red || []),
                                    ].find(
                                      (p) => p.id === option.origin.playerId
                                    )?.name
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-md">
                            <span className="font-medium">
                              Votos ({voters.length}):
                            </span>
                            <div className="voting-dots">
                              {voters.map((voterId, vIndex) => (
                                <div
                                  key={vIndex}
                                  className={`vote-dot ${getVoterDot(voterId)}`}
                                  title={
                                    [
                                      ...(lobby.teams?.blue || []),
                                      ...(lobby.teams?.red || []),
                                    ].find((p) => p.id === voterId)?.name ||
                                    'Jugador'
                                  }
                                ></div>
                              ))}
                              {voters.length === 0 && (
                                <span className="text-sm text-muted">
                                  Sin votos
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* Separador */}
                <div className="my-lg border-t border-white/20"></div>

                {/* Puntos ganados esta ronda por equipo */}
                {gameState.results?.pointsAwarded && (
                  <div className="mb-lg">
                    <h3 className="font-bold text-center mb-md text-lg text-yellow-400">
                      🎯 Puntos Ganados Esta Ronda
                    </h3>

                    {/* Calcular puntos por equipo esta ronda */}
                    {(() => {
                      let blueRoundPoints = 0;
                      let redRoundPoints = 0;

                      Object.entries(gameState.results.pointsAwarded).forEach(
                        ([playerId, points]: [string, any]) => {
                          const player = [
                            ...(lobby.teams?.blue || []),
                            ...(lobby.teams?.red || []),
                          ].find((p) => p.id === playerId);
                          if (player?.team === 'blue') {
                            blueRoundPoints += points || 0;
                          } else if (player?.team === 'red') {
                            redRoundPoints += points || 0;
                          }
                        }
                      );

                      return (
                        <div className="grid grid-cols-2 gap-md mb-md">
                          <div className="text-center p-md bg-blue-600/30 rounded-lg border border-blue-400">
                            <div className="text-sm mb-xs">🔵 Equipo Azul</div>
                            <div className="text-3xl font-bold text-yellow-400">
                              +{blueRoundPoints}
                            </div>
                            <div className="text-xs mt-xs opacity-75">
                              esta ronda
                            </div>
                          </div>
                          <div className="text-center p-md bg-red-600/30 rounded-lg border border-red-400">
                            <div className="text-sm mb-xs">🔴 Equipo Rojo</div>
                            <div className="text-3xl font-bold text-yellow-400">
                              +{redRoundPoints}
                            </div>
                            <div className="text-xs mt-xs opacity-75">
                              esta ronda
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Desglose por jugador */}
                    <div className="bg-white/5 p-md rounded-lg">
                      <div className="text-xs font-bold mb-sm text-center opacity-75">
                        Desglose Individual:
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                        {Object.entries(gameState.results.pointsAwarded).map(
                          ([playerId, points]: [string, any]) => {
                            const player = [
                              ...(lobby.teams?.blue || []),
                              ...(lobby.teams?.red || []),
                            ].find((p) => p.id === playerId);
                            if (!points || points === 0) return null;
                            return (
                              <div
                                key={playerId}
                                className="flex justify-between items-center p-sm bg-white bg-opacity-10 rounded text-sm"
                              >
                                <span>
                                  {player?.team === 'blue' ? '🔵' : '🔴'}{' '}
                                  {player?.name || 'Jugador'}
                                </span>
                                <span className="font-bold text-yellow-400">
                                  +{points}
                                </span>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Marcador General Acumulado */}
                {gameState.results?.newScores && (
                  <div className="mb-lg">
                    <div className="bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-red-500/20 p-lg rounded-xl border-2 border-white/30 shadow-lg">
                      <h3 className="font-bold text-center mb-md text-xl">
                        🏆 Marcador Total
                      </h3>
                      <div className="grid grid-cols-2 gap-lg">
                        <div className="text-center p-md bg-blue-600/40 rounded-lg border-2 border-blue-400">
                          <div className="text-sm mb-xs opacity-90">Equipo</div>
                          <div className="text-lg font-bold mb-sm">🔵 AZUL</div>
                          <div className="text-4xl font-black">
                            {gameState.results.newScores.blue || 0}
                          </div>
                          <div className="text-xs mt-xs opacity-75">
                            puntos totales
                          </div>
                        </div>
                        <div className="text-center p-md bg-red-600/40 rounded-lg border-2 border-red-400">
                          <div className="text-sm mb-xs opacity-90">Equipo</div>
                          <div className="text-lg font-bold mb-sm">🔴 ROJO</div>
                          <div className="text-4xl font-black">
                            {gameState.results.newScores.red || 0}
                          </div>
                          <div className="text-xs mt-xs opacity-75">
                            puntos totales
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isHost && (
                  <div className="text-center">
                    <p className="text-secondary mb-md text-sm">
                      Usa el Panel de Control para continuar
                    </p>
                    <div className="pulse text-accent text-sm">
                      <span>⚡ Listo para continuar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="min-h-screen flex items-center">
            <div className="container">
              <div className="card text-center">
                <h2 className="text-lg font-bold mb-md text-accent">
                  Estado desconocido: {gameState.phase}
                </h2>
                <div className="spinner mx-auto"></div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Contenido principal con padding para footer y panel de host */}
      <div className={isHost ? 'pb-40' : 'pb-20'}>{renderGameContent()}</div>

      {/* Footer con marcador (siempre visible para todos) */}
      <div
        className={`fixed left-0 right-0 p-sm bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-red-600/90 backdrop-blur-sm border-t-2 border-white/30 z-40 ${
          isHost ? 'bottom-24' : 'bottom-0'
        }`}
      >
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-md text-center">
            <div className="flex items-center justify-center gap-sm">
              <span className="text-2xl">🔵</span>
              <div>
                <div className="text-xs opacity-75">Equipo Azul</div>
                <div className="text-xl font-black">
                  {gameState?.scores?.blue || 0}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-sm">
              <span className="text-2xl">🔴</span>
              <div>
                <div className="text-xs opacity-75">Equipo Rojo</div>
                <div className="text-xl font-black">
                  {gameState?.scores?.red || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de control del host (encima del footer) */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 p-md bg-primary/95 backdrop-blur-sm border-t border-gray-700 z-50">
          <div className="container mx-auto max-w-4xl">
            <HostControlPanel
              gameState={gameState}
              lobby={lobby}
              socket={socket}
            />
          </div>
        </div>
      )}
    </div>
  );
}
