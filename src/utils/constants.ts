import { Timeframes, IndicatorSettingsConfig } from '../types/chart';

export const TIMEFRAMES: Timeframes = {
  '1m': {
    interval: '1m',
    wsUrl: 'btcusdt@kline_1m',
    limit: 200
  },
  '5m': {
    interval: '5m',
    wsUrl: 'btcusdt@kline_5m',
    limit: 200
  },
  '15m': {
    interval: '15m',
    wsUrl: 'btcusdt@kline_15m',
    limit: 200
  },
  '1h': {
    interval: '1h',
    wsUrl: 'btcusdt@kline_1h',
    limit: 200
  },
  'D': {
    interval: '1d',
    wsUrl: 'btcusdt@kline_1d',
    limit: 365
  },
  'W': {
    interval: '1w',
    wsUrl: 'btcusdt@kline_1w',
    limit: 52
  },
  'M': {
    interval: '1M',
    wsUrl: 'btcusdt@kline_1M',
    limit: 12
  }
};

export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettingsConfig = {
  volume: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    opacity: 1
  },
  bb: {
    period: 20,
    stdDev: 2,
    color: '#4caf50',
    opacity: 0.1,
    width: 1
  },
  superTrend: {
    period: 10,
    multiplier: 3,
    upColor: '#4caf50',
    downColor: '#f44336',
    width: 2
  },
  vwap: {
    color: '#e91e63',
    width: 2,
    showBands: false,
    stdDev: 2,
    bandOpacity: 0.1,
    resetPeriod: 'D'
  },
  ichimoku: {
    tenkanPeriod: 9,
    kijunPeriod: 26,
    senkouBPeriod: 52,
    displacement: 26,
    tenkanColor: '#2196f3',
    kijunColor: '#ff5722',
    cloudBullColor: '#4caf5033',
    cloudBearColor: '#f4433633',
    width: 1
  },
  pivots: {
    type: 'standard',
    timeFrame: 'D',
    pivotColor: '#ffd700',
    supportColor: '#4caf50',
    resistanceColor: '#f44336',
    width: 1,
    showLabels: true
  },
  avwap: {
    color: '#9c27b0',
    width: 1,
    anchorDate: null,
    showBands: false,
    bandOpacity: 0.1
  }
};

export const BINANCE_API_URL = 'https://api.binance.com/api/v3';
export const DEFAULT_SYMBOL = 'BTCUSDT';