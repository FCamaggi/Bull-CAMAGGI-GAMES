interface HostControlPanelProps {
  gameState: any;
  lobby: any;
  socket: any;
}

export default function HostControlPanel({
  gameState,
  lobby,
  socket,
}: HostControlPanelProps) {
  const handleNextPhase = () => {
    console.log('🎮 Host: Avanzar fase desde', gameState.phase);
    socket.emit('next_phase');
  };

  const renderControls = () => {
    const getButtonConfig = () => {
      switch (gameState.phase) {
        case 'waiting':
          return {
            label: `▶️ Iniciar Ronda ${gameState.currentRound}`,
            description:
              'Mostrará la pregunta y comenzará la fase de escritura',
            enabled: true,
          };

        case 'writing':
          const currentRound = gameState.rounds?.find(
            (r: any) => r.number === gameState.currentRound
          );
          const answersCount = currentRound?.playerAnswers
            ? Object.keys(currentRound.playerAnswers).length
            : 0;
          const allAnswersSubmitted = answersCount >= 2;

          return {
            label: '🗳️ Iniciar Votación',
            description: allAnswersSubmitted
              ? '✅ Todas las respuestas recibidas'
              : `Respuestas: ${answersCount} / 2`,
            enabled: allAnswersSubmitted,
          };

        case 'voting':
          const votingRound = gameState.rounds?.find(
            (r: any) => r.number === gameState.currentRound
          );
          const totalPlayers =
            (lobby.teams?.blue?.length || 0) + (lobby.teams?.red?.length || 0);
          const votesSubmitted = votingRound?.votes
            ? Object.keys(votingRound.votes).length
            : 0;
          const allVotesIn = votesSubmitted >= totalPlayers;

          return {
            label: '📊 Mostrar Resultados',
            description: allVotesIn
              ? '✅ Todos han votado'
              : `Votos: ${votesSubmitted} / ${totalPlayers}`,
            enabled: allVotesIn,
          };

        case 'results':
          const isLastRound =
            gameState.currentRound >= (lobby.settings?.maxRounds || 5);

          if (isLastRound) {
            return {
              label: '🏁 Juego Terminado',
              description: 'Este fue el último round',
              enabled: false,
            };
          }

          return {
            label: '➡️ Siguiente Ronda',
            description: `Pasar a la ronda ${gameState.currentRound + 1}`,
            enabled: true,
          };

        default:
          return {
            label: '⏸️ Esperando...',
            description: `Fase actual: ${gameState.phase}`,
            enabled: false,
          };
      }
    };

    return getButtonConfig();
  };

  const config = renderControls();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-sm md:gap-md">
      {/* Info del juego */}
      <div className="flex items-center gap-sm flex-shrink-0">
        <span className="text-lg">👑</span>
        <div className="text-xs">
          <div className="font-bold text-accent">Control del Host</div>
          <div className="text-muted">
            Ronda {gameState.currentRound}/{lobby.settings?.maxRounds || 'N/A'}{' '}
            • {gameState.phase}
          </div>
        </div>
      </div>

      {/* Descripción y botón */}
      <div className="flex-1 flex flex-col md:flex-row items-stretch md:items-center gap-sm w-full">
        <div className="flex-1 text-xs">
          <span className={config.enabled ? 'text-accent' : 'text-muted'}>
            {config.description}
          </span>
        </div>
        <button
          onClick={handleNextPhase}
          className="btn btn-primary whitespace-nowrap"
          disabled={!config.enabled}
        >
          {config.label}
        </button>
      </div>
    </div>
  );
}
