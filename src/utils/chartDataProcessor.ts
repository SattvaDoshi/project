import { WebSocketMessage, ChartData, Candle } from '../types/chart';

export class ChartDataProcessor {
  private candleHistory: Candle[] = [];
  private maxCandles: number = 100;
  private currentCandle: Candle | null = null;

  constructor(initialHistory: Candle[] = []) {
    this.candleHistory = initialHistory;
  }

  processWebSocketMessage(message: WebSocketMessage): ChartData | null {
    try {
      if (!message.k) return null;

      const kline = message.k;
      const candle: Candle = {
        time: kline.t,
        timestamp: new Date(kline.t).toLocaleTimeString(),
        open: parseFloat(kline.o),
        high: parseFloat(kline.h),
        low: parseFloat(kline.l),
        close: parseFloat(kline.c),
        volume: parseFloat(kline.v),
        isComplete: kline.x
      };

      if (candle.isComplete) {
        this.updateCandleHistory(candle);
        this.currentCandle = null;
      } else {
        this.currentCandle = candle;
      }

      return this.formatChartData();
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
      return null;
    }
  }

  setHistoricalData(candles: Candle[]) {
    this.candleHistory = candles.slice(-this.maxCandles);
    this.currentCandle = null;
  }

  private updateCandleHistory(candle: Candle) {
    const existingIndex = this.candleHistory.findIndex(c => c.time === candle.time);
    
    if (existingIndex !== -1) {
      // Update existing candle
      this.candleHistory[existingIndex] = candle;
    } else {
      // Add new candle
      this.candleHistory.push(candle);
      // Keep only the last maxCandles
      if (this.candleHistory.length > this.maxCandles) {
        this.candleHistory = this.candleHistory.slice(-this.maxCandles);
      }
    }

    // Sort candles by time
    this.candleHistory.sort((a, b) => a.time - b.time);
  }

  private formatChartData(): ChartData {
    const allCandles = [...this.candleHistory];
    if (this.currentCandle) {
      allCandles.push(this.currentCandle);
    }

    return {
      categoryData: allCandles.map(c => c.timestamp),
      values: allCandles.map(c => [c.open, c.close, c.low, c.high]),
      volumes: allCandles.map(c => c.volume),
      itemStyle: {
        color: '#26a69a', // Green color for bullish candles
        borderColor: '#26a69a',
        color0: '#ef5350', // Red color for bearish candles
        borderColor0: '#ef5350'
      }
    };
  }

  public getCurrentPrice(): string {
    if (this.currentCandle) {
      return this.currentCandle.close.toFixed(2);
    }
    if (this.candleHistory.length === 0) return '0.00';
    const lastCandle = this.candleHistory[this.candleHistory.length - 1];
    return lastCandle.close.toFixed(2);
  }

  public getPriceChange(): { value: string; percentage: string } {
    const currentPrice = this.currentCandle?.close ?? this.candleHistory[this.candleHistory.length - 1]?.close;
    const previousClose = this.candleHistory[this.candleHistory.length - 1]?.close;

    if (!currentPrice || !previousClose) {
      return { value: '0.00', percentage: '0.00' };
    }

    const change = currentPrice - previousClose;
    const percentage = (change / previousClose) * 100;

    return {
      value: change.toFixed(2),
      percentage: percentage.toFixed(2)
    };
  }

  public getCandleCount(): number {
    return this.candleHistory.length + (this.currentCandle ? 1 : 0);
  }
} 