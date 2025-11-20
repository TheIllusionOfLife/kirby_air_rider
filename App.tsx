import React, { useState } from 'react';
import GameCanvas from './components/GameCanvas';
import MainMenu from './components/MainMenu';
import ResultsScreen from './components/ResultsScreen';
import { GameStatus, RacerType, GameConfig, RacerState } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [config, setConfig] = useState<GameConfig>({
    totalLaps: 2,
    playerRacer: RacerType.KIRBY
  });
  const [results, setResults] = useState<RacerState[]>([]);

  const handleStart = (racer: RacerType) => {
    setConfig(prev => ({ ...prev, playerRacer: racer }));
    setStatus(GameStatus.RACING);
  };

  const handleFinish = (finalResults: RacerState[]) => {
    setResults(finalResults);
    // Transition to FINISHED, but we will keep rendering GameCanvas
    setStatus(GameStatus.FINISHED);
  };

  const handleRestart = () => {
    setStatus(GameStatus.MENU);
  };

  return (
    <div className="w-screen h-screen bg-gray-900 flex flex-col items-center justify-center font-sans">
      {status === GameStatus.MENU && (
        <MainMenu onStart={handleStart} />
      )}

      {/* Keep GameCanvas alive during RACING and FINISHED for the winning cinematic */}
      {(status === GameStatus.RACING || status === GameStatus.FINISHED) && (
        <GameCanvas config={config} onFinish={handleFinish} />
      )}

      {status === GameStatus.FINISHED && (
        <div className="absolute inset-0 z-50 pointer-events-auto">
             <ResultsScreen 
                results={results} 
                playerRacer={config.playerRacer} 
                onRestart={handleRestart} 
             />
        </div>
      )}
    </div>
  );
};

export default App;