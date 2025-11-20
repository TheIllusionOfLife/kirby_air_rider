import React, { useState } from 'react';
import { RacerType } from '../types';
import { RACER_STATS, UI_TEXT, RACER_NAMES_JP, RACER_SVGS, RACER_QUOTES, MAX_STATS, TITLE_LOGO_SVG } from '../constants';

interface MainMenuProps {
  onStart: (racer: RacerType) => void;
}

// Helper component for Stat Bars
const StatBar = ({ label, value, max, colorClass, isSelected }: { label: string, value: number, max: number, colorClass: string, isSelected: boolean }) => {
  const percentage = Math.min(100, Math.max(5, (value / max) * 100));
  
  return (
    <div className="w-full mb-2">
      <div className={`flex justify-between text-xs uppercase font-bold mb-1 ${isSelected ? 'text-gray-600' : 'text-gray-300'}`}>
        <span>{label}</span>
        <span className="opacity-50">{Math.round(percentage)}%</span>
      </div>
      <div className={`w-full h-3 rounded-full overflow-hidden border border-black/10 ${isSelected ? 'bg-black/10' : 'bg-black/40'}`}>
        <div 
          className={`h-full ${colorClass} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [selectedRacer, setSelectedRacer] = useState<RacerType>(RacerType.KIRBY);

  return (
    <div className="w-full h-full flex flex-col items-center justify-start md:justify-center bg-gradient-to-br from-blue-600 to-purple-800 text-white font-sans overflow-hidden relative">
      <div className="w-full flex flex-col items-center p-4 h-full overflow-y-auto scrollbar-hide pb-40">
          
          {/* LOGO */}
          <div className="w-full max-w-2xl mb-8 mt-4 md:mt-0 shrink-0 animate-float">
            <img src={TITLE_LOGO_SVG} alt={UI_TEXT.TITLE} className="w-full h-auto drop-shadow-2xl" />
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-8 md:mb-12 shrink-0 w-full max-w-5xl justify-center">
            {Object.values(RacerType).map((racer) => (
              <button
                key={racer}
                onClick={() => setSelectedRacer(racer)}
                className={`
                  relative flex md:flex-col items-center transition-all duration-300 overflow-hidden
                  rounded-xl border-4 p-4
                  ${selectedRacer === racer 
                    ? 'bg-gray-100 text-black border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.6)] scale-[1.02] md:scale-105 z-10' 
                    : 'bg-gray-800/60 border-gray-600 hover:bg-gray-700 text-gray-300 opacity-90'}
                  md:w-1/3 h-auto
                `}
              >
                {/* Character Image */}
                <div className="w-24 h-24 md:w-40 md:h-40 md:mb-4 relative z-10 drop-shadow-xl shrink-0">
                    <img 
                      src={RACER_SVGS[racer]} 
                      alt={racer} 
                      className={`w-full h-full object-contain ${selectedRacer === racer ? 'animate-bounce-slow' : ''}`} 
                    />
                </div>
                
                {/* Stats Panel */}
                <div className="flex flex-col w-full pl-4 md:pl-0 md:px-2 z-10">
                    <h2 className="text-xl md:text-2xl font-black mb-3 tracking-tight uppercase italic">
                      {RACER_NAMES_JP[racer]}
                    </h2>
                    
                    {/* Quote moved inside card */}
                    {selectedRacer === racer && (
                        <div className="mb-3 p-2 bg-yellow-200/50 rounded-lg border-l-4 border-orange-500">
                            <p className="text-sm font-bold italic text-orange-900 leading-tight">
                                "{RACER_QUOTES[racer]}"
                            </p>
                        </div>
                    )}

                    <div className={`rounded-lg p-3 w-full ${selectedRacer === racer ? 'bg-black/5' : 'bg-black/20'}`}>
                       <StatBar 
                          label={UI_TEXT.STATS.SPEED} 
                          value={RACER_STATS[racer].topSpeed} 
                          max={MAX_STATS.SPEED} 
                          colorClass="bg-gradient-to-r from-orange-400 to-red-500"
                          isSelected={selectedRacer === racer}
                       />
                       <StatBar 
                          label={UI_TEXT.STATS.TURN} 
                          value={RACER_STATS[racer].turnSpeed} 
                          max={MAX_STATS.TURN} 
                          colorClass="bg-gradient-to-r from-blue-400 to-cyan-500"
                          isSelected={selectedRacer === racer}
                       />
                       <StatBar 
                          label={UI_TEXT.STATS.WEIGHT} 
                          value={RACER_STATS[racer].weight} 
                          max={MAX_STATS.WEIGHT} 
                          colorClass="bg-gradient-to-r from-green-400 to-emerald-600"
                          isSelected={selectedRacer === racer}
                       />
                    </div>
                </div>

                {/* Background Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
              </button>
            ))}
          </div>
          
          <p className="mt-auto text-white/50 text-xs md:text-sm bg-black/20 px-6 py-2 rounded-full text-center mx-4 mb-4 backdrop-blur-sm border border-white/5">
            {UI_TEXT.CONTROLS}
          </p>
      </div>

      {/* Floating Start Button */}
      <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 pointer-events-none">
          <button
            onClick={() => onStart(selectedRacer)}
            className="pointer-events-auto px-20 py-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white text-3xl font-black rounded-full hover:brightness-110 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(255,100,0,0.6)] uppercase tracking-wider transform skew-x-[-10deg] border-4 border-white/20"
          >
            {UI_TEXT.START}
          </button>
      </div>
    </div>
  );
};

export default MainMenu;