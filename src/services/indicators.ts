import { ChartData } from '../types/chart';

export function calculateMA(data: number[][], period: number, type: 'sma' | 'ema' | 'wma' = 'sma'): number[] {
  const result: number[] = [];
  const closes = data.map(item => item[1]); // Get closing prices

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }

    if (type === 'ema') {
      // Calculate EMA
      const multiplier = 2 / (period + 1);
      if (i === period - 1) {
        // First EMA is SMA
        result.push(closes.slice(0, period).reduce((a, b) => a + b) / period);
      } else {
        result.push((closes[i] - result[i - 1]) * multiplier + result[i - 1]);
      }
    } else if (type === 'wma') {
      // Calculate WMA
      let sum = 0;
      let weightSum = 0;
      for (let j = 0; j < period; j++) {
        const weight = period - j;
        sum += closes[i - j] * weight;
        weightSum += weight;
      }
      result.push(sum / weightSum);
    } else {
      // Calculate SMA
      result.push(
        closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b) / period
      );
    }
  }

  return result;
}

export function calculateEMA(period: number, data: ChartData): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    if (i < period - 1) {
      result.push(NaN);
    }
    initialSum += data.values[i][1];
  }

  let ema = initialSum / period;
  result.push(ema);

  for (let i = period; i < data.values.length; i++) {
    const close = data.values[i][1];
    ema = (close - ema) * multiplier + ema;
    result.push(ema);
  }

  return result;
}

export function calculateBollingerBands(data: number[][], period: number, stdDev: number) {
  const closes = data.map(item => item[1]);
  const middle = calculateMA(data, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    const mean = sum / period;
    const squaredDiffs = slice.map(x => Math.pow(x - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const standardDeviation = Math.sqrt(variance);

    upper.push(middle[i] + standardDeviation * stdDev);
    lower.push(middle[i] - standardDeviation * stdDev);
  }

  return { upper, middle, lower };
}

export function calculateVWAP(data: number[][], volumes: number[]) {
  const result: number[] = [];
  let cumulativeTPV = 0; // Typical Price × Volume
  let cumulativeVolume = 0;

  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i][1] + data[i][2] + data[i][3]) / 3; // (High + Low + Close) / 3
    const volume = volumes[i];
    
    cumulativeTPV += typicalPrice * volume;
    cumulativeVolume += volume;
    
    result.push(cumulativeTPV / cumulativeVolume);
  }

  return result;
}

// Add more indicator calculations as needed