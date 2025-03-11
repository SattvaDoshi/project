import React from 'react';
import { X } from 'lucide-react';
import { IndicatorSettings } from '../types/chart';

interface IndicatorSettingsPanelProps {
  settings: IndicatorSettings;
  activeIndicator: string;
  position?: 'top' | 'bottom';
  onSettingChange: (setting: string, value: boolean, newSettings?: IndicatorSettings) => void;
  onClose: () => void;
}

type LineIndicator = {
  enabled: boolean;
  period: number;
  color: string;
  lineWidth: number;
};

type VolumeIndicator = {
  enabled: boolean;
  upColor: string;
  downColor: string;
};

export const IndicatorSettingsPanel: React.FC<IndicatorSettingsPanelProps> = ({
  settings,
  activeIndicator,
  onSettingChange,
  onClose,
}) => {
  const indicator = settings[activeIndicator as keyof IndicatorSettings];
  const isVolumeIndicator = activeIndicator === 'volume';
  
  const handlePeriodChange = (value: string) => {
    if (isVolumeIndicator) return;
    
    const period = parseInt(value);
    if (!isNaN(period) && period > 0 && period <= 200) {
      const newSettings = {
        ...settings,
        [activeIndicator]: {
          ...(indicator as LineIndicator),
          period
        }
      };
      onSettingChange(activeIndicator, true, newSettings);
    }
  };

  const handleColorChange = (value: string) => {
    if (isVolumeIndicator) {
      // Handle volume colors separately
      const newSettings = {
        ...settings,
        volume: {
          ...settings.volume,
          upColor: value,
          downColor: value
        }
      };
      onSettingChange('volume', true, newSettings);
    } else {
      const newSettings = {
        ...settings,
        [activeIndicator]: {
          ...(indicator as LineIndicator),
          color: value
        }
      };
      onSettingChange(activeIndicator, true, newSettings);
    }
  };

  const handleLineWidthChange = (value: string) => {
    if (isVolumeIndicator) return;

    const width = parseInt(value);
    if (!isNaN(width) && width > 0 && width <= 10) {
      const newSettings = {
        ...settings,
        [activeIndicator]: {
          ...(indicator as LineIndicator),
          lineWidth: width
        }
      };
      onSettingChange(activeIndicator, true, newSettings);
    }
  };

  const handleResetToDefault = () => {
    if (isVolumeIndicator) {
      const defaultSettings = {
        enabled: true,
        upColor: '#26a69a',
        downColor: '#ef5350'
      };

      const newSettings = {
        ...settings,
        volume: {
          ...settings.volume,
          ...defaultSettings
        }
      };
      onSettingChange('volume', true, newSettings);
    } else {
      const defaultSettings = {
        period: 10,
        lineWidth: 1,
        color: '#FF9800',
        enabled: true
      };

      const newSettings = {
        ...settings,
        [activeIndicator]: {
          ...(indicator as LineIndicator),
          ...defaultSettings
        }
      };
      onSettingChange(activeIndicator, true, newSettings);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-30"
        onClick={onClose}
      />
      
      {/* Settings Panel */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-[#1e222d] rounded-lg shadow-xl w-[320px]"
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-[#d1d4dc] text-lg font-medium">
              {activeIndicator.toUpperCase()} Settings
            </h3>
            <button
              onClick={onClose}
              className="text-[#787b86] hover:text-[#d1d4dc] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Period Input */}
          {!isVolumeIndicator && (
            <div className="mb-5">
              <label className="block text-[#787b86] text-sm mb-2">
                Period
              </label>
              <input
                type="number"
                value={(indicator as LineIndicator).period || 10}
                onChange={(e) => handlePeriodChange(e.target.value)}
                min="1"
                max="200"
                className="w-full bg-[#2a2e39] text-[#d1d4dc] px-3 py-2 rounded border border-[#363c4e] focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          )}

          {/* Line Color */}
          {isVolumeIndicator ? (
            <>
              <div className="mb-5">
                <label className="block text-[#787b86] text-sm mb-2">
                  Up Color
                </label>
                <input
                  type="color"
                  value={(indicator as VolumeIndicator).upColor}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      volume: {
                        ...settings.volume,
                        upColor: e.target.value
                      }
                    };
                    onSettingChange('volume', true, newSettings);
                  }}
                  className="w-full h-8 bg-[#2a2e39] rounded border border-[#363c4e] cursor-pointer"
                />
              </div>
              <div className="mb-5">
                <label className="block text-[#787b86] text-sm mb-2">
                  Down Color
                </label>
                <input
                  type="color"
                  value={(indicator as VolumeIndicator).downColor}
                  onChange={(e) => {
                    const newSettings = {
                      ...settings,
                      volume: {
                        ...settings.volume,
                        downColor: e.target.value
                      }
                    };
                    onSettingChange('volume', true, newSettings);
                  }}
                  className="w-full h-8 bg-[#2a2e39] rounded border border-[#363c4e] cursor-pointer"
                />
              </div>
            </>
          ) : (
            <div className="mb-5">
              <label className="block text-[#787b86] text-sm mb-2">
                Line Color
              </label>
              <input
                type="color"
                value={(indicator as LineIndicator).color || '#FF9800'}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-8 bg-[#2a2e39] rounded border border-[#363c4e] cursor-pointer"
              />
            </div>
          )}

          {/* Line Width */}
          {!isVolumeIndicator && (
            <div className="mb-5">
              <label className="block text-[#787b86] text-sm mb-2">
                Line Width
              </label>
              <input
                type="number"
                value={(indicator as LineIndicator).lineWidth || 1}
                onChange={(e) => handleLineWidthChange(e.target.value)}
                min="1"
                max="10"
                className="w-full bg-[#2a2e39] text-[#d1d4dc] px-3 py-2 rounded border border-[#363c4e] focus:outline-none focus:border-[#2962ff]"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2 bg-[#2a2e39] text-[#d1d4dc] rounded hover:bg-[#363a45] transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#2962ff] text-white rounded hover:bg-[#2258e4] transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
}; 