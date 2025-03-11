import React from 'react';
import { LineChart, Activity, TrendingUp, BarChart2, Waves } from 'lucide-react';
import { TIMEFRAMES } from '../utils/constants';
import { IndicatorSettings } from '../types/chart';

interface TimeframeIndicatorMenuProps {
  settings: IndicatorSettings;
  onSettingChange: (setting: keyof IndicatorSettings, value: boolean) => void;
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

      {/* Moving Averages */}
      <div className="mb-4">
        <h3 className="text-[#787b86] text-xs mb-2">Moving Averages</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSettingChange('sma', !settings.sma.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.sma.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ borderLeft: `3px solid ${settings.sma.color}` }}
          >
            <LineChart size={16} className="mr-2" />
            SMA {settings.sma.period}
          </button>
          <button
            onClick={() => onSettingChange('ema', !settings.ema.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.ema.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ borderLeft: `3px solid ${settings.ema.color}` }}
          >
            <LineChart size={16} className="mr-2" />
            EMA {settings.ema.period}
          </button>
          <button
            onClick={() => onSettingChange('wma', !settings.wma.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.wma.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ borderLeft: `3px solid ${settings.wma.color}` }}
          >
            <LineChart size={16} className="mr-2" />
            WMA {settings.wma.period}
          </button>
        </div>
      </div>

      {/* Other Indicators */}
      <div>
        <h3 className="text-[#787b86] text-xs mb-2">Other Indicators</h3>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onSettingChange('bb', !settings.bb.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.bb.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ borderLeft: `3px solid ${settings.bb.color}` }}
          >
            <Waves size={16} className="mr-2" />
            BB {settings.bb.period}
          </button>
          <button
            onClick={() => onSettingChange('vwap', !settings.vwap.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.vwap.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ borderLeft: `3px solid ${settings.vwap.color}` }}
          >
            <TrendingUp size={16} className="mr-2" />
            VWAP
          </button>
          <button
            onClick={() => onSettingChange('volume', !settings.volume.enabled)}
            className={`flex items-center px-3 py-1.5 rounded text-sm ${
              settings.volume.enabled ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc]'
            }`}
            style={{ 
              borderLeft: `3px solid ${settings.volume.enabled ? settings.volume.upColor : '#787b86'}`
            }}
          >
            <BarChart2 size={16} className="mr-2" />
            VOL
          </button>
        </div>
      </div>
    </div>
  );
};
