import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { EChartsOption, SeriesOption } from 'echarts';
import { ChartData, IndicatorSettings } from '../types/chart';
import { calculateMA, calculateBollingerBands, calculateVWAP } from '../services/indicators';

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
  onSettingChange: (setting: string, value: boolean) => void;
}

export const Chart: React.FC<ChartProps> = ({ 
  data, 
  settings, 
  isDarkMode,
  currentPrice,
  priceChange,
  selectedTimeframe,
  onTimeframeChange,
  onSettingChange
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, isDarkMode ? 'dark' : undefined);
    chartInstance.current = chart;

    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.dispose();
      chartInstance.current = null;
    };
  }, [isDarkMode]);

  // Update chart options
  useEffect(() => {
    if (!chartInstance.current || !data.values.length) {
      console.log('No chart instance or data');
      return;
    }

    console.log('Updating chart with data:', data.values.length, 'candles');

    // Initialize series and legend data arrays
    const series: SeriesOption[] = [];
    const legendData: string[] = [];

    // Add main candlestick series
    series.push({
      name: 'Candlestick',
      type: 'candlestick',
      data: data.values,
      itemStyle: {
        color0: '#ef5350',
        color: '#26a69a',
        borderColor0: '#ef5350',
        borderColor: '#26a69a'
      }
    });
    legendData.push('Candlestick');

    // Add volume bars if enabled
    if (settings.volume) {
      const volumeSeries: SeriesOption = {
        name: 'Volume',
        type: 'bar',
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: data.volumes.map((volume, i) => ({
          value: volume,
          itemStyle: {
            color: data.values[i][1] > data.values[i][0] ? '#ef5350' : '#26a69a'
          }
        }))
      };
      series.push(volumeSeries);
      legendData.push('Volume');
    }

    // Add MA indicators if enabled
    if (settings.ma) {
      const maData = calculateMA(data.values);
      const maColors = ['#7b1fa2', '#1e88e5', '#43a047', '#fb8c00'];
      const maPeriods = [5, 10, 20, 30];

      maPeriods.forEach((period, index) => {
        const name = `MA${period}`;
        const maSeries: SeriesOption = {
          name,
          type: 'line',
          data: maData[index],
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: maColors[index]
          }
        };
        series.push(maSeries);
        legendData.push(name);
      });
    }

    // Add Bollinger Bands if enabled
    if (settings.bb) {
      const bbData = calculateBollingerBands(data.values);
      const bbSeries: SeriesOption[] = [
        {
          name: 'BB Upper',
          type: 'line',
          data: bbData.upper,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: '#ff9800'
          }
        },
        {
          name: 'BB Lower',
          type: 'line',
          data: bbData.lower,
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: '#ff9800'
          }
        }
      ];
      series.push(...bbSeries);
      legendData.push('BB Upper', 'BB Lower');
    }

    // Add VWAP if enabled
    if (settings.vwap) {
      const vwapData = calculateVWAP(data.values, data.volumes);
      const vwapSeries: SeriesOption = {
        name: 'VWAP',
        type: 'line',
        data: vwapData,
        smooth: true,
        lineStyle: {
          opacity: 0.5,
          color: '#e91e63'
        }
      };
      series.push(vwapSeries);
      legendData.push('VWAP');
    }

    const option: EChartsOption = {
      backgroundColor: isDarkMode ? '#131722' : '#ffffff',
      animation: false,
      legend: {
        bottom: 10,
        left: 'center',
        data: legendData,
        textStyle: {
          color: isDarkMode ? '#ffffff' : '#000000'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        },
        backgroundColor: isDarkMode ? '#1e222d' : '#ffffff',
        borderColor: isDarkMode ? '#2a2e39' : '#e0e0e0',
        textStyle: {
          color: isDarkMode ? '#ffffff' : '#000000'
        }
      },
      axisPointer: {
        link: [{ xAxisIndex: 'all' }],
        label: {
          backgroundColor: isDarkMode ? '#2a2e39' : '#e0e0e0'
        }
      },
      grid: [
        {
          left: '3%',
          right: '3%',
          top: '8%',
          height: '60%'
        },
        {
          left: '3%',
          right: '3%',
          top: '75%',
          height: '15%'
        }
      ],
      xAxis: [
        {
          type: 'category',
          data: data.categoryData,
          boundaryGap: true,
          axisLine: { 
            lineStyle: { 
              color: isDarkMode ? '#2a2e39' : '#e0e0e0' 
            } 
          },
          splitLine: { 
            show: true,
            lineStyle: { 
              color: isDarkMode ? '#2a2e39' : '#f5f5f5'
            }
          },
          min: 'dataMin',
          max: 'dataMax',
          axisLabel: {
            show: true,
            color: isDarkMode ? '#787b86' : '#999999'
          }
        },
        {
          type: 'category',
          gridIndex: 1,
          data: data.categoryData,
          boundaryGap: true,
          axisLine: { 
            lineStyle: { 
              color: isDarkMode ? '#2a2e39' : '#e0e0e0' 
            } 
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          scale: true,
          splitNumber: 6,
          position: 'right',
          axisLine: {
            lineStyle: {
              color: isDarkMode ? '#2a2e39' : '#e0e0e0'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: isDarkMode ? '#2a2e39' : '#f5f5f5'
            }
          },
          axisLabel: {
            color: isDarkMode ? '#787b86' : '#999999',
            formatter: (value: number) => value.toFixed(2)
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          position: 'right',
          axisLine: {
            lineStyle: {
              color: isDarkMode ? '#2a2e39' : '#e0e0e0'
            }
          },
          axisLabel: {
            color: isDarkMode ? '#787b86' : '#999999',
            formatter: (value: number) => value.toFixed(0)
          },
          splitLine: { show: false }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100
        },
        {
          show: true,
          type: 'slider',
          bottom: 5,
          height: 30,
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
          handleIcon: 'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '120%',
          handleStyle: {
            color: isDarkMode ? '#2962ff' : '#1e88e5',
            shadowBlur: 3,
            shadowColor: 'rgba(0, 0, 0, 0.6)',
            shadowOffsetX: 2,
            shadowOffsetY: 2
          }
        }
      ],
      series
    };

    try {
      chartInstance.current.setOption(option, true);
      console.log('Chart options set successfully');
    } catch (error) {
      console.error('Error setting chart options:', error);
    }
  }, [data, settings, isDarkMode]);

  return (
    <div className="fixed top-14 left-14 right-[20%] bottom-0 bg-[#131722]">
      {/* Price Display */}
      <div className="absolute top-4 right-20 z-1 bg-[rgba(19,23,34,0.8)] p-2 rounded">
        <span className="text-base font-bold mr-2">${currentPrice}</span>
        <span className={`text-${parseFloat(priceChange.value) >= 0 ? '[#26a69a]' : '[#ef5350]'}`}>
          {priceChange.value >= '0' ? '+' : ''}{priceChange.value} ({priceChange.value >= '0' ? '+' : ''}{priceChange.percentage}%)
        </span>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }} 
      />
    </div>
  );
};