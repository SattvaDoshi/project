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
  volumes: [],
  itemStyle: {
    color: '#26a69a',
    borderColor: '#26a69a',
    color0: '#ef5350',
    borderColor0: '#ef5350'
  }
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTool, setActiveTool] = useState('pointer');
  const [chartData, setChartData] = useState<ChartData>({
    categoryData: [],
    values: [],
    volumes: [],
    itemStyle: {
      color: '#26a69a',
      borderColor: '#26a69a',
      color0: '#ef5350',
      borderColor0: '#ef5350'
    }
  });
  const [settings, setSettings] = useState<IndicatorSettings>({
    sma: {
      enabled: false,
      period: 20,
      color: '#2962FF'
    },
    ema: {
      enabled: false,
      period: 20,
      color: '#FF6B6B'
    },
    wma: {
      enabled: false,
      period: 20,
      color: '#33B252'
    },
    bb: {
      enabled: false,
      period: 20,
      stdDev: 2,
      color: '#B71CFF'
    },
    vwap: {
      enabled: false,
      color: '#FF9800'
    },
    volume: {
      enabled: true,
      upColor: '#26a69a',
      downColor: '#ef5350'
    }
  });
  const [signals, setSignals] = useState<Signal[]>([]);
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const [currentPrice, setCurrentPrice] = useState('0.00');
  const [priceChange, setPriceChange] = useState({ value: '0.00', percentage: '0.00' });
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [showIndicatorModal, setShowIndicatorModal] = useState(false);

  const updateChartData = useCallback((data: any) => {
    setChartData(prevData => {
      const newData = { ...prevData };
      const timeStr = data.time;

      if (data.isComplete) {
        // Add new complete candle
        newData.categoryData = [...prevData.categoryData, timeStr];
        newData.values = [...prevData.values, [data.open, data.close, data.high, data.low]];
        newData.volumes = [...prevData.volumes, data.volume];

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
          newData.volumes[lastIndex] = data.volume;
        } else {
          // First candle
          newData.categoryData = [timeStr];
          newData.values = [[data.open, data.close, data.high, data.low]];
          newData.volumes = [data.volume];
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
    const ws = new WebSocketService('btcusdt', TIMEFRAMES[selectedTimeframe].interval);
    setWsService(ws);

    ws.connect((data) => {
      if (data.categoryData && data.values && data.volumes) {
        setChartData({
          categoryData: data.categoryData,
          values: data.values,
          volumes: data.volumes,
          itemStyle: {
            color: '#26a69a',
            borderColor: '#26a69a',
            color0: '#ef5350',
            borderColor0: '#ef5350'
          }
        });
        setCurrentPrice(data.currentPrice);
        setPriceChange(data.priceChange);
      }
    });

    return () => {
      ws.disconnect();
    };
  }, [selectedTimeframe]);

  const handleThemeToggle = () => {
    setIsDarkMode(prev => !prev);
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
  };

  const handleStrategyChange = (strategy: any) => {
    // Handle strategy change
  };

  const handleSettingChange = (setting: keyof IndicatorSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: {
        ...prev[setting],
        enabled: value
      }
    }));
  };

  const handleTimeframeChange = (timeframe: string) => {
    setSelectedTimeframe(timeframe);
  };

  const handleIndicatorClick = () => {
    setShowIndicatorModal(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <TopNav 
        onThemeToggle={handleThemeToggle} 
        isDarkMode={isDarkMode}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={handleTimeframeChange}
        settings={settings}
        onSettingChange={handleSettingChange}
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
                                checked={value.enabled}
                                onChange={(e) => handleSettingChange(key as keyof IndicatorSettings, e.target.checked)}
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