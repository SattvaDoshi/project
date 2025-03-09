import React from 'react';
import { Bell, Sun, Moon, RotateCcw, LineChart, BarChart2, Activity } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';

interface TopNavProps {
  onThemeToggle: () => void;
  isDarkMode: boolean;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  onIndicatorClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  onThemeToggle,
  isDarkMode,
  selectedTimeframe,
  onTimeframeChange,
  onIndicatorClick
}) => {
  return (
    <div className="fixed top-0 left-0 right-[20%] z-90 h-14 bg-[#1e222d] border-b border-[#2a2e39] flex justify-between items-center px-4">
      <div className="left-controls flex items-center gap-4">
        {/* Symbol Info */}
        <div className="symbol-info pr-4 border-r border-[#2a2e39] mr-4">
          <span className="symbol text-base font-bold">NIFTY</span>
          <span className="exchange text-sm text-[#787b86] ml-2">NSE</span>
        </div>

        {/* Timeframe Controls */}
        <div className="timeframe-controls flex items-center">
          {Object.keys(TIMEFRAMES).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className={`px-3 py-1.5 text-sm rounded ${
                selectedTimeframe === timeframe
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Chart Controls */}
        <div className="chart-controls flex items-center gap-2 ml-4">
          <button className="p-2 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
            <LineChart size={16} />
          </button>
          <button className="p-2 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
            <BarChart2 size={16} />
          </button>
        </div>

        {/* Indicators Button */}
        <div className="indicators ml-4">
          <button
            onClick={onIndicatorClick}
            className="flex items-center px-3 py-1.5 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded"
          >
            <Activity size={16} className="mr-2" />
            Indicators
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="right-controls flex items-center gap-3">
        <button className="p-2 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
          <Bell size={16} />
        </button>
        <button className="flex items-center px-3 py-1.5 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
          <RotateCcw size={16} className="mr-2" />
          Replay
        </button>
        <button
          onClick={onThemeToggle}
          className="p-2 text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
};