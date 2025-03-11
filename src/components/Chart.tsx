import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption, SeriesOption } from 'echarts';
import { ChartData, IndicatorSettings } from '../types/chart';
import { calculateMA, calculateBollingerBands, calculateVWAP } from '../services/indicators';
import { Settings, X } from 'lucide-react';
import { IndicatorSettingsPanel } from './IndicatorSettingsPanel';

interface ChartProps {
  data: ChartData;
  settings: IndicatorSettings;
  isDarkMode: boolean;
  currentPrice: string;
  priceChange: {
    value: string;
    percentage: string;
  };
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  onSettingChange: (setting: string, value: boolean, newSettings?: IndicatorSettings) => void;
}

export const Chart: React.FC<ChartProps> = ({
  data,
  settings,
  isDarkMode,
  currentPrice,
  priceChange,
  selectedTimeframe,
  onTimeframeChange,
  onSettingChange,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const dataZoomStateRef = useRef<{ start: number; end: number } | null>(null);
  const [activeIndicator, setActiveIndicator] = useState<string | null>(null);
  const prevDataLengthRef = useRef<number>(0);
  const prevSettingsRef = useRef(settings);
  const prevTimeframeRef = useRef(selectedTimeframe);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const isInitialRender = useRef(true);

  const handleIndicatorUpdate = (type: string, key: string, value: any) => {
    const newSettings = {
      ...settings,
      [type]: {
        ...settings[type as keyof IndicatorSettings],
        [key]: value,
      },
    };
    onSettingChange(type, true, newSettings);
  };

  // Function to generate chart options
  const generateChartOptions = useCallback(() => {
    if (!data.values.length) return {};

    const series: SeriesOption[] = [];
    const legendData: string[] = [];

    series.push({
      name: 'Candlestick',
      type: 'candlestick',
      data: data.values,
      itemStyle: data.itemStyle,
    });
    legendData.push('Candlestick');

    if (settings.volume?.enabled) {
      const volumeSeries: SeriesOption = {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.volumes.map((volume, i) => ({
          value: volume,
          itemStyle: {
            color: data.values[i][1] >= data.values[i][0]
              ? settings.volume.upColor
              : settings.volume.downColor,
          },
        })),
      };
      series.push(volumeSeries);
      legendData.push('Volume');
    }

    if (settings.sma?.enabled) {
      const smaData = calculateMA(data.values, settings.sma.period);
      series.push({
        name: `SMA(${settings.sma.period})`,
        type: 'line',
        data: smaData,
        smooth: true,
        lineStyle: { opacity: 0.8, color: settings.sma.color, width: settings.sma.lineWidth || 1 },
      });
      legendData.push(`SMA(${settings.sma.period})`);
    }

    if (settings.ema?.enabled) {
      const emaData = calculateMA(data.values, settings.ema.period, 'ema');
      series.push({
        name: `EMA(${settings.ema.period})`,
        type: 'line',
        data: emaData,
        smooth: true,
        lineStyle: { opacity: 0.8, color: settings.ema.color, width: settings.ema.lineWidth || 1 },
      });
      legendData.push(`EMA(${settings.ema.period})`);
    }

    if (settings.wma?.enabled) {
      const wmaData = calculateMA(data.values, settings.wma.period, 'wma');
      series.push({
        name: `WMA(${settings.wma.period})`,
        type: 'line',
        data: wmaData,
        smooth: true,
        lineStyle: { opacity: 0.8, color: settings.wma.color, width: settings.wma.lineWidth || 1 },
      });
      legendData.push(`WMA(${settings.wma.period})`);
    }

    if (settings.bb?.enabled) {
      const bbData = calculateBollingerBands(data.values, settings.bb.period, settings.bb.stdDev);
      series.push(
        {
          name: `BB(${settings.bb.period}, ${settings.bb.stdDev}) Upper`,
          type: 'line',
          data: bbData.upper,
          smooth: true,
          lineStyle: { opacity: 0.6, color: settings.bb.color, width: settings.bb.lineWidth || 1 },
        },
        {
          name: `BB(${settings.bb.period}, ${settings.bb.stdDev}) Middle`,
          type: 'line',
          data: bbData.middle,
          smooth: true,
          lineStyle: {
            opacity: 0.6,
            color: settings.bb.color,
            width: settings.bb.lineWidth || 1,
            type: 'dashed',
          },
        },
        {
          name: `BB(${settings.bb.period}, ${settings.bb.stdDev}) Lower`,
          type: 'line',
          data: bbData.lower,
          smooth: true,
          lineStyle: { opacity: 0.6, color: settings.bb.color, width: settings.bb.lineWidth || 1 },
        }
      );
      legendData.push(
        `BB(${settings.bb.period}, ${settings.bb.stdDev}) Upper`,
        `BB(${settings.bb.period}, ${settings.bb.stdDev}) Middle`,
        `BB(${settings.bb.period}, ${settings.bb.stdDev}) Lower`
      );
    }

    if (settings.vwap?.enabled) {
      const vwapData = calculateVWAP(data.values, data.volumes);
      series.push({
        name: 'VWAP',
        type: 'line',
        data: vwapData,
        smooth: true,
        lineStyle: { opacity: 0.8, color: settings.vwap.color, width: settings.vwap.lineWidth || 1 },
      });
      legendData.push('VWAP');
    }

    const option: EChartsOption = {
      backgroundColor: isDarkMode ? '#131722' : '#ffffff',
      animation: false,
      legend: {
        bottom: 10,
        left: 'center',
        data: legendData,
        textStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        backgroundColor: isDarkMode ? '#1e222d' : '#ffffff',
        borderColor: isDarkMode ? '#2a2e39' : '#e0e0e0',
        textStyle: { color: isDarkMode ? '#ffffff' : '#000000' },
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        label: { backgroundColor: isDarkMode ? '#2a2e39' : '#e0e0e0' },
      },
      grid: settings.volume.enabled
        ? [
            { left: '3%', right: '3%', top: '8%', height: '60%' },
            { left: '3%', right: '3%', top: '75%', height: '15%' },
          ]
        : [{ left: '3%', right: '3%', top: '8%', height: '82%' }],
      xAxis: settings.volume.enabled
        ? [
            {
              type: 'category',
              data: data.categoryData,
              boundaryGap: false,
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              splitLine: { show: false },
              min: 'dataMin',
              max: 'dataMax',
              axisLabel: { color: isDarkMode ? '#787b86' : '#999999' },
            },
            {
              type: 'category',
              gridIndex: 1,
              data: data.categoryData,
              boundaryGap: false,
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              axisTick: { show: false },
              splitLine: { show: false },
              axisLabel: { show: false },
              min: 'dataMin',
              max: 'dataMax',
            },
          ]
        : [
            {
              type: 'category',
              data: data.categoryData,
              boundaryGap: false,
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              splitLine: { show: false },
              min: 'dataMin',
              max: 'dataMax',
              axisLabel: { color: isDarkMode ? '#787b86' : '#999999' },
            },
          ],
      yAxis: settings.volume.enabled
        ? [
            {
              scale: true,
              splitNumber: 6,
              position: 'right',
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              splitLine: { show: true, lineStyle: { color: isDarkMode ? '#2a2e39' : '#f5f5f5' } },
              axisLabel: {
                color: isDarkMode ? '#787b86' : '#999999',
                formatter: (value: number) => value.toFixed(2),
              },
            },
            {
              scale: true,
              gridIndex: 1,
              splitNumber: 2,
              position: 'right',
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              axisLabel: {
                color: isDarkMode ? '#787b86' : '#999999',
                formatter: (value: number) => value.toFixed(0),
              },
              splitLine: { show: false },
            },
          ]
        : [
            {
              scale: true,
              splitNumber: 6,
              position: 'right',
              axisLine: { lineStyle: { color: isDarkMode ? '#2a2e39' : '#e0e0e0' } },
              splitLine: { show: true, lineStyle: { color: isDarkMode ? '#2a2e39' : '#f5f5f5' } },
              axisLabel: {
                color: isDarkMode ? '#787b86' : '#999999',
                formatter: (value: number) => value.toFixed(2),
              },
            },
          ],
      dataZoom: settings.volume.enabled
        ? [
            {
              type: 'inside',
              xAxisIndex: [0, 1],
              start: dataZoomStateRef.current?.start ?? 50,
              end: dataZoomStateRef.current?.end ?? 100,
            },
            {
              show: true,
              type: 'slider',
              bottom: 5,
              height: 30,
              xAxisIndex: [0, 1],
              start: dataZoomStateRef.current?.start ?? 50,
              end: dataZoomStateRef.current?.end ?? 100,
              handleIcon:
                'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '120%',
              handleStyle: {
                color: isDarkMode ? '#2962ff' : '#1e88e5',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
            },
          ]
        : [
            {
              type: 'inside',
              xAxisIndex: [0],
              start: dataZoomStateRef.current?.start ?? 50,
              end: dataZoomStateRef.current?.end ?? 100,
            },
            {
              show: true,
              type: 'slider',
              bottom: 5,
              height: 30,
              xAxisIndex: [0],
              start: dataZoomStateRef.current?.start ?? 50,
              end: dataZoomStateRef.current?.end ?? 100,
              handleIcon:
                'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
              handleSize: '120%',
              handleStyle: {
                color: isDarkMode ? '#2962ff' : '#1e88e5',
                shadowBlur: 3,
                shadowColor: 'rgba(0, 0, 0, 0.6)',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
              },
            },
          ],
      series,
    };

    return option;
  }, [data, settings, isDarkMode]);

  // Update chart function with throttling
  const updateChart = useCallback((chart: echarts.ECharts, forceUpdate = false) => {
    if (!chart || !data.values.length) return;

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
    const option = generateChartOptions();

    // If not a forced update and recent update, skip
    if (!forceUpdate && timeSinceLastUpdate < 1000) {
      return;
    }

    try {
      if (forceUpdate) {
        chart.setOption(option, {
          notMerge: true,
          replaceMerge: ['series'],
          lazyUpdate: false
        });
      } else {
        chart.setOption(option, {
          notMerge: false,
          lazyUpdate: true
        });
      }
      lastUpdateTimeRef.current = now;
    } catch (error) {
      console.error('Error updating chart:', error);
    }
  }, [data, generateChartOptions]);

  // Handle data and settings updates
  useEffect(() => {
    if (!chartInstance.current || !data.values.length) return;

    const chart = chartInstance.current;
    const currentDataLength = data.values.length;
    const hasTimeframeChange = selectedTimeframe !== prevTimeframeRef.current;
    const hasSettingsChange = JSON.stringify(settings) !== JSON.stringify(prevSettingsRef.current);
    
    // Clear any pending updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Always update on timeframe change or settings change
    if (hasTimeframeChange || hasSettingsChange || isInitialRender.current) {
      updateTimeoutRef.current = setTimeout(() => {
        updateChart(chart, true);
        
        // Update refs
        prevDataLengthRef.current = currentDataLength;
        prevSettingsRef.current = JSON.parse(JSON.stringify(settings));
        prevTimeframeRef.current = selectedTimeframe;
        isInitialRender.current = false;
      }, 100);
    } 
    // For data updates, use incremental updates
    else if (currentDataLength !== prevDataLengthRef.current) {
      updateTimeoutRef.current = setTimeout(() => {
        updateChart(chart, false);
        prevDataLengthRef.current = currentDataLength;
      }, 100);
    }

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [data, settings, selectedTimeframe, updateChart]);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, isDarkMode ? 'dark' : undefined);
    chartInstance.current = chart;
    lastUpdateTimeRef.current = Date.now();

    // Initial chart setup
    if (data.values.length) {
      const option = generateChartOptions();
      chart.setOption(option);
    }

    const handleResize = () => {
      chart.resize();
    };

    chart.on('datazoom', (params: any) => {
      if (params.batch) {
        dataZoomStateRef.current = {
          start: params.batch[0].start,
          end: params.batch[0].end,
        };
      } else {
        dataZoomStateRef.current = { start: params.start, end: params.end };
      }
    });

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [isDarkMode, data.values.length, generateChartOptions]);

  return (
    <div className="fixed top-14 left-14 right-[20%] bottom-0 bg-[#131722]">
      <div className="absolute top-4 right-20 z-1 bg-[rgba(19,23,34,0.8)] p-2 rounded">
        <span className="text-base font-bold mr-2">${currentPrice}</span>
        <span className={`text-${parseFloat(priceChange.value) >= 0 ? '[#26a69a]' : '[#ef5350]'}`}>
          {priceChange.value >= '0' ? '+' : ''}{priceChange.value} ({priceChange.value >= '0' ? '+' : ''}{priceChange.percentage}%)
        </span>
      </div>

      {activeIndicator && (
        <IndicatorSettingsPanel
          settings={settings}
          onSettingChange={onSettingChange}
          activeIndicator={activeIndicator}
          onClose={() => setActiveIndicator(null)}
          position={activeIndicator === 'volume' ? 'bottom' : 'top'}
        />
      )}

      <div className="absolute top-4 left-4 z-10">
        <div className="space-y-1">
          {Object.entries(settings)
            .filter(([type, value]) => value.enabled && type !== 'volume')
            .map(([type, indicator]) => (
              <div key={type} className="flex items-center space-x-2 text-sm text-[#d1d4dc] bg-[#1e222d] px-3 py-2 rounded">
                <button
                  onClick={() => setActiveIndicator(type)}
                  className="flex items-center space-x-2 hover:text-white"
                >
                  <Settings size={14} className="text-[#787b86]" />
                  <span>{type.toUpperCase()} {type !== 'volume' && indicator.period}</span>
                </button>
                <button
                  onClick={() => {
                    const newSettings = {
                      ...settings,
                      [type]: { ...settings[type as keyof IndicatorSettings], enabled: false },
                    };
                    onSettingChange(type, false, newSettings);
                    setActiveIndicator(null);
                  }}
                  className="text-[#787b86] hover:text-[#d1d4dc]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      </div>

      {settings.volume.enabled && (
        <div className="absolute left-4 bottom-[20%] z-10">
          <div className="flex items-center space-x-2 text-sm text-[#d1d4dc] bg-[#1e222d] px-3 py-2 rounded">
            <button
              onClick={() => setActiveIndicator('volume')}
              className="flex items-center space-x-2 hover:text-white"
            >
              <Settings size={14} className="text-[#787b86]" />
              <span>VOLUME</span>
            </button>
            <button
              onClick={() => {
                const newSettings = { ...settings, volume: { ...settings.volume, enabled: false } };
                onSettingChange('volume', false, newSettings);
                setActiveIndicator(null);
              }}
              className="text-[#787b86] hover:text-[#d1d4dc]"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div
        ref={chartRef}
        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </div>
  );
};