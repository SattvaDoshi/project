import React from 'react';
import { LineChart, Activity, TrendingUp, BarChart2 } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';
import { IndicatorSettings } from '../types/chart';

interface TimeframeIndicatorMenuProps {
  settings: IndicatorSettings;
  onSettingChange: (setting: string, value: boolean) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
}

export const TimeframeIndicatorMenu: React.FC<TimeframeIndicatorMenuProps> = ({
  settings,
  onSettingChange,
  selectedTimeframe,
  onTimeframeChange,
}) => {
  return (
    <div className="absolute top-0 left-0 z-50 bg-[#1e222d] border border-[#2a2e39] rounded-lg shadow-lg p-4 mt-12">
      {/* Timeframes */}
      <div className="mb-4">
        <h3 className="text-[#787b86] text-xs mb-2">Timeframe</h3>
        <div className="grid grid-cols-4 gap-2">
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
      </div>

      {/* Indicators */}
      <div>
        <h3 className="text-[#787b86] text-xs mb-2">Indicators</h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSettingChange('ma', !settings.ma)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.ma ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
          >
            <LineChart size={16} className="mr-2" />
            MA
          </button>
          <button
            onClick={() => onSettingChange('bb', !settings.bb)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.bb ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
          >
            <Activity size={16} className="mr-2" />
            BB
          </button>
          <button
            onClick={() => onSettingChange('vwap', !settings.vwap)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.vwap ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
          >
            <TrendingUp size={16} className="mr-2" />
            VWAP
          </button>
          <button
            onClick={() => onSettingChange('volume', !settings.volume)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.volume ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
          >
            <BarChart2 size={16} className="mr-2" />
            Volume
          </button>
        </div>
      </div>
    </div>
  );
};
