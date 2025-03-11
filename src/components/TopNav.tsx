import React from 'react';
import { Sun, Moon, Activity, Bell, RotateCcw, BarChart3, LineChart } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';
import { IndicatorSettings } from '../types/chart';

interface TopNavProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  settings: IndicatorSettings;
  onSettingChange: (setting: keyof IndicatorSettings, value: boolean) => void;
  onIndicatorClick: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  isDarkMode,
  onThemeToggle,
  selectedTimeframe,
  onTimeframeChange,
  onIndicatorClick
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-[#1e222d] border-b border-[#2a2e39] flex items-center justify-between px-4 z-50">
      {/* Left section */}
      <div className="flex items-center space-x-6">
        {/* Symbol Info */}
        <div className="flex items-center space-x-2">
          <span className="text-[#d1d4dc] font-semibold text-lg">NIFTY</span>
          <span className="text-[#787b86] text-sm">NSE</span>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1">
          {Object.keys(TIMEFRAMES).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className={`px-3 py-1.5 rounded text-sm ${
                selectedTimeframe === timeframe
                  ? 'bg-[#2962ff] text-white'
                  : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>

        {/* Chart Type Controls */}
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]">
            <LineChart size={18} />
          </button>
          <button className="p-2 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]">
            <BarChart3 size={18} />
          </button>
        </div>

        {/* Indicator Button */}
        <button
          onClick={onIndicatorClick}
          className="flex items-center px-3 py-1.5 rounded text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]"
        >
          <Activity size={16} className="mr-2" />
          Indicators
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]">
          <Bell size={18} />
        </button>

        {/* Replay */}
        <button className="flex items-center px-3 py-1.5 rounded text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]">
          <RotateCcw size={16} className="mr-2" />
          Replay
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded hover:bg-[#2a2e39] text-[#787b86] hover:text-[#d1d4dc]"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </div>
  );
};