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

  useEffect(() => {
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current, isDarkMode ? 'dark' : undefined, {
          renderer: 'canvas'
        });
      }
      
      const handleResize = () => {
        chartInstance.current?.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chartInstance.current?.dispose();
      };
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!chartInstance.current || !data.values.length) return;

    const option: EChartsOption = {
      backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
      animation: false,
      legend: {
        bottom: 10,
        left: 'center',
        data: ['MA5', 'MA10', 'MA20', 'MA30', 'BB Upper', 'BB Lower', 'VWAP', 'Volume'],
        textStyle: {
          color: isDarkMode ? '#ffffff' : '#000000'
        }
      },
      grid: [
        {
          left: '10%',
          right: '8%',
          height: '50%'
        },
        {
          left: '10%',
          right: '8%',
          top: '63%',
          height: '16%'
        }
      ],
      xAxis: [
        {
          type: 'category' as const,
          data: data.categoryData,
          axisLabel: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax'
        },
        {
          type: 'category' as const,
          gridIndex: 1,
          data: data.categoryData,
          axisLabel: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          scale: true,
          splitNumber: 5,
          position: 'right' as const,
          axisLine: {
            lineStyle: {
              color: isDarkMode ? '#ffffff' : '#000000'
            }
          },
          splitLine: {
            show: true
          },
          axisLabel: {
            inside: true
          },
          axisTick: {
            show: false
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          position: 'right' as const,
          axisLine: {
            lineStyle: {
              color: isDarkMode ? '#ffffff' : '#000000'
            }
          },
          axisLabel: {
            inside: true
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        }
      ],
      dataZoom: [
        {
          type: 'inside',
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
          handleStyle: {
            color: isDarkMode ? '#ffffff' : '#000000'
          }
        }
      ],
      series: [
        {
          name: 'Candlestick',
          type: 'candlestick',
          data: data.values,
          itemStyle: {
            color: '#ef5350',
            color0: '#26a69a',
            borderColor: '#ef5350',
            borderColor0: '#26a69a'
          },
          emphasis: {
            itemStyle: {
              color: '#ef5350',
              color0: '#26a69a',
              borderColor: '#ef5350',
              borderColor0: '#26a69a'
            }
          }
        }
      ] as SeriesOption[]
    };

    // Add volume bars
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
    (option.series as SeriesOption[]).push(volumeSeries);

    // Add indicators if enabled
    if (settings.ma) {
      const maData = calculateMA(data.values);
      const maColors = ['#7b1fa2', '#1e88e5', '#43a047', '#fb8c00'];
      const maPeriods = [5, 10, 20, 30];

      maPeriods.forEach((period, index) => {
        const maSeries: SeriesOption = {
          name: `MA${period}`,
          type: 'line',
          data: maData[index],
          smooth: true,
          lineStyle: {
            opacity: 0.5,
            color: maColors[index]
          }
        };
        (option.series as SeriesOption[]).push(maSeries);
      });
    }

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
      (option.series as SeriesOption[]).push(...bbSeries);
    }

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
      (option.series as SeriesOption[]).push(vwapSeries);
    }

    chartInstance.current.setOption(option, true);
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
      <div ref={chartRef} className="w-full h-full" />
    </div>
  );
};