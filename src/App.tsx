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
      color: '#2962FF',
      lineWidth: 1
    },
    ema: {
      enabled: false,
      period: 20,
      color: '#FF6B6B',
      lineWidth: 1
    },
    wma: {
      enabled: false,
      period: 20,
      color: '#33B252',
      lineWidth: 1
    },
    bb: {
      enabled: false,
      period: 20,
      stdDev: 2,
      color: '#B71CFF',
      lineWidth: 1
    },
    vwap: {
      enabled: false,
      color: '#FF9800',
      lineWidth: 1
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

  const handleSettingChange = (setting: string, value: boolean, newSettings?: IndicatorSettings) => {
    if (newSettings) {
      setSettings(newSettings);
    } else {
      setSettings(prev => ({
        ...prev,
        [setting]: {
          ...prev[setting as keyof IndicatorSettings],
          enabled: value
        }
      }));
    }
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
            <div className="p-4 border-b border-[#2a2e39] flex justify-between items-center">
              <h2 className="text-lg font-medium text-[#d1d4dc]">Indicators, metrics, and strategies</h2>
              <button 
                onClick={() => setShowIndicatorModal(false)}
                className="text-[#787b86] hover:text-[#d1d4dc] text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-2 bg-[#2a2e39] border border-[#363c4e] rounded text-[#d1d4dc] focus:outline-none focus:border-[#2962ff] text-sm"
                />
              </div>
              <div className="flex">
                <div className="w-[200px] border-r border-[#2a2e39] pr-4">
                  {/* Left Sidebar */}
                  <div className="space-y-1">
                    <button className="flex items-center w-full px-3 py-2 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
                      <span className="mr-2">⭐</span>
                      Favorites
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
                      <span className="mr-2">👤</span>
                      Personal
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm bg-[#2962ff] text-white rounded">
                      <span className="mr-2">📊</span>
                      Technicals
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
                      <span className="mr-2">💰</span>
                      Financials
                    </button>
                    <button className="flex items-center w-full px-3 py-2 text-sm text-[#787b86] hover:bg-[#2a2e39] hover:text-[#d1d4dc] rounded">
                      <span className="mr-2">👥</span>
                      Community
                    </button>
                  </div>
                </div>
                <div className="flex-1 pl-4">
                  {/* Main Content */}
                  <div className="space-y-6">
                    {/* Moving Averages Section */}
                    <div>
                      <h3 className="text-[#d1d4dc] text-sm font-medium mb-2">Moving Averages</h3>
                      <div className="space-y-2">
                        <label className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.sma.enabled}
                            onChange={(e) => handleSettingChange('sma' as string, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-[#2962ff] rounded border-[#363c4e] bg-[#2a2e39] mr-3"
                          />
                          <div className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm ${
                            settings.sma.enabled ? 'text-[#d1d4dc]' : 'text-[#787b86] group-hover:text-[#d1d4dc]'
                          }`}>
                            <span>MA 5</span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#1E88E5' }}></span>
                          </div>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.ema.enabled}
                            onChange={(e) => handleSettingChange('ema' as string, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-[#2962ff] rounded border-[#363c4e] bg-[#2a2e39] mr-3"
                          />
                          <div className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm ${
                            settings.ema.enabled ? 'text-[#d1d4dc]' : 'text-[#787b86] group-hover:text-[#d1d4dc]'
                          }`}>
                            <span>MA 10</span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF9800' }}></span>
                          </div>
                        </label>
                        <label className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.wma.enabled}
                            onChange={(e) => handleSettingChange('wma' as string, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-[#2962ff] rounded border-[#363c4e] bg-[#2a2e39] mr-3"
                          />
                          <div className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm ${
                            settings.wma.enabled ? 'text-[#d1d4dc]' : 'text-[#787b86] group-hover:text-[#d1d4dc]'
                          }`}>
                            <span>MA 20</span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E91E63' }}></span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Volume Studies Section */}
                    <div>
                      <h3 className="text-[#d1d4dc] text-sm font-medium mb-2">Volume Studies</h3>
                      <div className="space-y-2">
                        <label className="flex items-center group cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.volume.enabled}
                            onChange={(e) => handleSettingChange('volume' as string, e.target.checked)}
                            className="form-checkbox h-4 w-4 text-[#2962ff] rounded border-[#363c4e] bg-[#2a2e39] mr-3"
                          />
                          <div className={`flex items-center justify-between w-full px-3 py-2 rounded text-sm ${
                            settings.volume.enabled ? 'text-[#d1d4dc]' : 'text-[#787b86] group-hover:text-[#d1d4dc]'
                          }`}>
                            <span>Volume</span>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00BCD4' }}></span>
                          </div>
                        </label>
                      </div>
                    </div>
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