import React, { useState, useEffect, useCallback } from 'react';
import { TopNav } from './components/TopNav';
import { SidePanel } from './components/SidePanel';
import { Chart } from './components/Chart';
import { StrategyAssistant } from './components/StrategyAssistant';
import { WebSocketService } from './services/websocket';
import { DEFAULT_SYMBOL, DEFAULT_INDICATOR_SETTINGS, TIMEFRAMES } from './utils/constants';
import type { ChartData, Signal, IndicatorSettings } from './types/chart';

const MAX_CANDLES = 200;

const initialData: ChartData = {
  categoryData: [],
  values: [],
  volumes: []
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTool, setActiveTool] = useState('pointer');
  const [chartData, setChartData] = useState(initialData);
  const [settings, setSettings] = useState<IndicatorSettings>({
    volume: DEFAULT_INDICATOR_SETTINGS.volume,
    ma5: false,
    ma10: false,
    ma20: false,
    ema20: false,
    showVolume: false,
    showBB: false,
    showSuperTrend: false,
    showVWAP: false,
    showIchimoku: false,
    showPivots: false,
    showAVWAP: false
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const [currentPrice, setCurrentPrice] = useState<string>('0.00');
  const [priceChange, setPriceChange] = useState<{ value: string; percentage: string }>({ value: '0.00', percentage: '0.00' });
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1m');
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);

  const updateChartData = useCallback((data: any) => {
    setChartData(prevData => {
      const newData = { ...prevData };
      const timeStr = data.time;

      if (data.isComplete) {
        // Add new complete candle
        newData.categoryData = [...prevData.categoryData, timeStr];
        newData.values = [...prevData.values, [data.open, data.close, data.high, data.low]];
        newData.volumes = [...prevData.volumes, [timeStr, data.volume, data.close - data.open]];

        // Keep only last MAX_CANDLES candles
        if (newData.categoryData.length > MAX_CANDLES) {
          newData.categoryData = newData.categoryData.slice(-MAX_CANDLES);
          newData.values = newData.values.slice(-MAX_CANDLES);
          newData.volumes = newData.volumes.slice(-MAX_CANDLES);
        }
      } else {
        // Update last candle
        const lastIndex = prevData.categoryData.length - 1;
        if (lastIndex >= 0) {
          newData.values = [...prevData.values];
          newData.volumes = [...prevData.volumes];
          newData.values[lastIndex] = [data.open, data.close, data.high, data.low];
          newData.volumes[lastIndex] = [timeStr, data.volume, data.close - data.open];
        } else {
          // First candle
          newData.categoryData = [timeStr];
          newData.values = [[data.open, data.close, data.high, data.low]];
          newData.volumes = [[timeStr, data.volume, data.close - data.open]];
        }
      }

      return newData;
    });

    // Update price info
    setCurrentPrice(data.close.toFixed(2));
    const change = data.close - data.open;
    const percentage = ((change / data.open) * 100).toFixed(2);
    setPriceChange({
      value: change.toFixed(2),
      percentage: percentage
    });
  }, []);

  useEffect(() => {
    const ws = new WebSocketService(DEFAULT_SYMBOL, TIMEFRAMES[selectedTimeframe].wsUrl);
    setWsService(ws);

    // Reset chart data when timeframe changes
    setChartData(initialData);

    ws.connect(updateChartData);

    return () => {
      ws.disconnect();
    };
  }, [selectedTimeframe, updateChartData]);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
  };

  const handleStrategyChange = (strategy: any) => {
    // Handle strategy change
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const handleIndicatorClick = () => {
    setShowIndicatorModal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#131722]' : 'bg-white'}`}>
      <TopNav 
        onThemeToggle={handleThemeToggle} 
        isDarkMode={isDarkMode}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={handleTimeframeChange}
        onIndicatorClick={handleIndicatorClick}
      />
      <SidePanel onToolSelect={setActiveTool} activeTool={activeTool} />
      <Chart 
        data={chartData} 
        settings={settings} 
        isDarkMode={isDarkMode}
        currentPrice={currentPrice}
        priceChange={priceChange}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={handleTimeframeChange}
        onSettingChange={handleSettingChange}
      />
      <StrategyAssistant onStrategyChange={handleStrategyChange} signals={signals} />

      {/* Indicator Modal */}
      {showIndicatorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-[#1e222d] rounded-lg w-[800px] max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-[#2a2e39] flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#d1d4dc]">Indicators, metrics, and strategies</h2>
              <button 
                onClick={() => setShowIndicatorModal(false)}
                className="text-[#787b86] hover:text-[#d1d4dc]"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search indicators..."
                  className="w-full px-4 py-2 bg-[#2a2e39] border border-[#363c4e] rounded text-[#d1d4dc] focus:outline-none focus:border-[#2962ff]"
                />
              </div>
              <div className="flex mt-4">
                <div className="w-1/4 border-r border-[#2a2e39]">
                  {/* Categories */}
                  <div className="space-y-2">
                    {['Favorites', 'Personal', 'Technicals', 'Financials', 'Community'].map((category) => (
                      <button
                        key={category}
                        className="w-full px-4 py-2 text-left text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 pl-4">
                  {/* Indicator Groups */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-[#d1d4dc] font-medium mb-2">Moving Averages</h3>
                      <div className="space-y-2">
                        {Object.entries(settings)
                          .filter(([key]) => key.includes('ma') || key.includes('ema'))
                          .map(([key, value]) => (
                            <label key={key} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleSettingChange(key, e.target.checked)}
                                className="form-checkbox text-[#2962ff] rounded border-[#363c4e]"
                              />
                              <span className="text-[#d1d4dc]">{key.toUpperCase()}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                    {/* Add more indicator groups as needed */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;