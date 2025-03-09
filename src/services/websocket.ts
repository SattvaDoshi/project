import { WebSocketMessage, Candle } from '../types/chart';
import { ChartDataProcessor } from '../utils/chartDataProcessor';

export class WebSocketService {
  private ws: WebSocket | null = null;
  private symbol: string;
  private wsUrl: string;
  private messageHandler: ((data: any) => void) | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 5000;
  private isConnected: boolean = false;
  private mockDataInterval: NodeJS.Timeout | null = null;
  private dataProcessor: ChartDataProcessor;

  constructor(symbol: string, wsUrl: string) {
    this.symbol = symbol;
    this.wsUrl = wsUrl;
    this.dataProcessor = new ChartDataProcessor();
  }

  private async fetchHistoricalData() {
    try {
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${this.symbol.toUpperCase()}&interval=${this.wsUrl}&limit=100`);
      const data = await response.json();
      
      const candles: Candle[] = data.map((item: any) => ({
        time: item[0],
        timestamp: new Date(item[0]).toLocaleTimeString(),
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
        isComplete: true
      }));

      this.dataProcessor.setHistoricalData(candles);
      
      if (this.messageHandler) {
        const chartData = this.dataProcessor.formatChartData();
        const currentPrice = this.dataProcessor.getCurrentPrice();
        const priceChange = this.dataProcessor.getPriceChange();
        
        this.messageHandler({
          ...chartData,
          currentPrice,
          priceChange
        });
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  }

  public async connect(handler: (data: any) => void) {
    this.messageHandler = handler;
    
    // Fetch historical data first
    await this.fetchHistoricalData();
    
    if (this.ws) {
      this.ws.close();
    }

    // Format WebSocket URL for Binance
    const wsEndpoint = `wss://stream.binance.com:9443/ws/${this.symbol}@kline_${this.wsUrl}`;
    this.ws = new WebSocket(wsEndpoint);

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        const chartData = this.dataProcessor.processWebSocketMessage(message);
        
        if (chartData && this.messageHandler) {
          const currentPrice = this.dataProcessor.getCurrentPrice();
          const priceChange = this.dataProcessor.getPriceChange();
          
          this.messageHandler({
            ...chartData,
            currentPrice,
            priceChange
          });
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket Error:', error);
      this.isConnected = false;
      this.reconnect();
    };

    this.ws.onclose = () => {
      console.log('WebSocket Disconnected');
      this.isConnected = false;
      this.reconnect();
    };
  }

  private startMockDataFeed() {
    if (this.mockDataInterval) return;

    let lastPrice = 50000;
    let lastTime = Date.now();

    this.mockDataInterval = setInterval(() => {
      const now = Date.now();
      const change = (Math.random() - 0.5) * 100;
      const newPrice = lastPrice + change;
      
      const mockMessage: WebSocketMessage = {
        e: 'kline',
        E: now,
        s: this.symbol,
        k: {
          t: now,
          T: now + 60000,
          s: this.symbol,
          i: this.wsUrl,
          f: now - 60000,
          L: now,
          o: lastPrice.toString(),
          c: newPrice.toString(),
          h: Math.max(lastPrice, newPrice).toString(),
          l: Math.min(lastPrice, newPrice).toString(),
          v: (Math.random() * 100).toString(),
          n: 100,
          x: now - lastTime >= 60000,
          q: '0',
          V: '0',
          Q: '0',
          B: '0'
        }
      };

      const chartData = this.dataProcessor.processWebSocketMessage(mockMessage);
      if (chartData && this.messageHandler) {
        const currentPrice = this.dataProcessor.getCurrentPrice();
        const priceChange = this.dataProcessor.getPriceChange();
        
        this.messageHandler({
          ...chartData,
          currentPrice,
          priceChange
        });
      }

      if (mockMessage.k.x) {
        lastTime = now;
      }
      lastPrice = newPrice;
    }, 1000);
  }

  private stopMockDataFeed() {
    if (this.mockDataInterval) {
      clearInterval(this.mockDataInterval);
      this.mockDataInterval = null;
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... Attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`);
      setTimeout(() => {
        if (this.messageHandler) {
          this.connect(this.messageHandler);
        }
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1));
    } else {
      console.log('Max reconnection attempts reached, falling back to mock data');
      this.startMockDataFeed();
    }
  }

  public disconnect() {
    this.stopMockDataFeed();

    if (this.ws) {
      if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
        const unsubscribeMessage = {
          method: 'UNSUBSCRIBE',
          params: [`${this.symbol}@kline_${this.wsUrl}`],
          id: 1
        };
        this.ws.send(JSON.stringify(unsubscribeMessage));
      }
      
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  public changeSymbol(symbol: string) {
    this.symbol = symbol;
    this.reconnectAttempts = 0;
    this.dataProcessor = new ChartDataProcessor();
    if (this.messageHandler) {
      this.disconnect();
      this.connect(this.messageHandler);
    }
  }

  public changeInterval(interval: string) {
    this.wsUrl = interval;
    this.reconnectAttempts = 0;
    this.dataProcessor = new ChartDataProcessor();
    if (this.messageHandler) {
      this.disconnect();
      this.connect(this.messageHandler);
    }
  }
}