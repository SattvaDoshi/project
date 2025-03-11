import React from 'react';
import { Sun, Moon, Activity, BarChart2 } from 'lucide-react';
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
  settings,
  onSettingChange,
  onIndicatorClick
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-[#1e222d] border-b border-[#2a2e39] flex items-center justify-between px-4 z-50">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          className="p-2 rounded hover:bg-[#2a2e39] text-[#787b86]"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-2">
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

        {/* Indicator Button */}
        <button
          onClick={onIndicatorClick}
          className="flex items-center px-3 py-1.5 rounded text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]"
        >
          <Activity size={16} className="mr-2" />
          Indicators
        </button>

        <button
            onClick={() => onSettingChange('volume', !settings.volume.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.volume.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
          >
            <BarChart2 size={16} className="mr-2" />
            VOL
          </button>
        
      </div>
    </div>
  );
};