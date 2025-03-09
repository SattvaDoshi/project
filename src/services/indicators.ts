import { ChartData } from '../types/chart';

export function calculateMA(data: number[][]): number[][] {
  const periods = [5, 10, 20, 30];
  return periods.map(period => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result.push(NaN);
        continue;
      }
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j][1];
      }
      result.push(sum / period);
    }
    return result;
  });
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

export function calculateBollingerBands(data: number[][]) {
  const period = 20;
  const stdDev = 2;
  const middle = [];
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      middle.push(NaN);
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }

    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][1];
    }
    const sma = sum / period;
    middle.push(sma);

    let squareSum = 0;
    for (let j = 0; j < period; j++) {
      squareSum += Math.pow(data[i - j][1] - sma, 2);
    }
    const std = Math.sqrt(squareSum / period);
    upper.push(sma + stdDev * std);
    lower.push(sma - stdDev * std);
  }

  return { upper, lower };
}

export function calculateVWAP(data: number[][], volumes: number[]) {
  const result = [];
  let sumPV = 0;
  let sumV = 0;

  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i][1] + data[i][2] + data[i][3]) / 3;
    sumPV += typicalPrice * volumes[i];
    sumV += volumes[i];
    result.push(sumPV / sumV);
  }

  return result;
}

// Add more indicator calculations as needed