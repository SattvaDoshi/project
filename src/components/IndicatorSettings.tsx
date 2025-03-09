import React from 'react';
import { IndicatorSettingsConfig } from '../types/chart';

interface IndicatorSettingsProps {
  settings: IndicatorSettingsConfig;
  onSettingsChange: (newSettings: IndicatorSettingsConfig) => void;
  currentIndicator: string | null;
  onClose: () => void;
}

export const IndicatorSettings: React.FC<IndicatorSettingsProps> = ({
  settings,
  onSettingsChange,
  currentIndicator,
  onClose
}) => {
  const handleSettingChange = (category: string, setting: string, value: any) => {
    onSettingsChange({
      ...settings,
      [category]: {
        ...settings[category as keyof IndicatorSettingsConfig],
        [setting]: value
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1e222d] rounded-lg w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-[#2a2e39]">
          <h2 className="text-xl font-semibold text-[#d1d4dc]">
            {currentIndicator === 'volume' ? 'Volume Settings' :
             currentIndicator === 'bb' ? 'Bollinger Bands Settings' :
             currentIndicator === 'superTrend' ? 'Super Trend Settings' :
             currentIndicator === 'vwap' ? 'VWAP Settings' :
             currentIndicator === 'ichimoku' ? 'Ichimoku Cloud Settings' :
             currentIndicator === 'pivots' ? 'Pivot Points Settings' :
             currentIndicator === 'avwap' ? 'AVWAP Settings' : 'Indicator Settings'}
          </h2>
        </div>

        <div className="p-6">
          {currentIndicator === 'volume' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#d1d4dc] mb-2">Up Color</label>
                <input
                  type="color"
                  value={settings.volume.upColor}
                  onChange={(e) => handleSettingChange('volume', 'upColor', e.target.value)}
                  className="w-full h-10 rounded bg-[#2a2e39] border border-[#363c4e]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#d1d4dc] mb-2">Down Color</label>
                <input
                  type="color"
                  value={settings.volume.downColor}
                  onChange={(e) => handleSettingChange('volume', 'downColor', e.target.value)}
                  className="w-full h-10 rounded bg-[#2a2e39] border border-[#363c4e]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#d1d4dc] mb-2">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume.opacity}
                  onChange={(e) => handleSettingChange('volume', 'opacity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Add similar sections for other indicators */}

        </div>

        <div className="p-6 border-t border-[#2a2e39] flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#d1d4dc] hover:bg-[#2a2e39] rounded"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2962ff] text-white rounded hover:bg-[#1e4bd8]"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};