import React, { useEffect, useState } from 'react';
import { RacerState, RacerType } from '../types';
import { getRaceCommentary } from '../services/geminiService';
import { UI_TEXT, RACER_NAMES_JP, RACER_SVGS } from '../constants';

interface ResultsScreenProps {
  results: RacerState[];
  playerRacer: RacerType;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ results, playerRacer, onRestart }) => {
  const [commentary, setCommentary] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const playerResult = results.find(r => r.isPlayer);
  const winner = results[0];
  const playerRank = results.indexOf(playerResult!) + 1;

  useEffect(() => {
    const fetchCommentary = async () => {
        setLoading(true);
        const text = await getRaceCommentary(winner.type, playerRacer, playerRank);
        setCommentary(text);
        setLoading(false);
    };
    fetchCommentary();
  }, [winner, playerRacer, playerRank]);

  return (
    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-end pb-12 text-white z-50 animate-fade-in">
      {/* Top Status */}
      <div className="absolute top-20 w-full flex justify-center">
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-red-500 italic transform -skew-x-12 drop-shadow-sm">
            {UI_TEXT.FINISHED}
          </h2>
      </div>
      
      {/* Minimal Rank Card */}
      <div className="w-full max-w-lg bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/20 mb-4 animate-slide-up">
        <div className="flex justify-between items-center mb-4">
            <span className="text-gray-400 font-bold">{UI_TEXT.RANK}</span>
            <span className="text-4xl font-black text-white italic">{playerRank}<span className="text-lg">位</span></span>
        </div>
        <div className="flex justify-between items-center">
            <span className="text-gray-400 font-bold">{UI_TEXT.TIME}</span>
            <span className="text-2xl font-mono text-yellow-300">{(playerResult?.finishTime ? (playerResult.finishTime/1000).toFixed(2) : '---')}s</span>
        </div>
      </div>

      {/* Commentary Toast */}
      <div className="w-full max-w-lg bg-indigo-900/80 backdrop-blur-md p-4 rounded-xl border-l-4 border-purple-500 shadow-lg mb-8 animate-slide-up animation-delay-200">
         {loading ? (
             <div className="flex gap-2">
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75" />
                 <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150" />
             </div>
         ) : (
             <p className="text-white font-medium text-sm leading-relaxed">"{commentary}"</p>
         )}
      </div>

      <button
        onClick={onRestart}
        className="px-12 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black rounded-full hover:scale-105 transition-all shadow-xl border-2 border-white/20"
      >
        {UI_TEXT.BACK_TO_MENU}
      </button>
    </div>
  );
};

export default ResultsScreen;