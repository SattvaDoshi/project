import { WebSocketMessage, Candle } from '../types/chart';

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
  private lastCandle: Candle | null = null;

  constructor(symbol: string, wsUrl: string) {
    this.symbol = symbol;
    this.wsUrl = wsUrl;
  }

  public connect(handler: (data: any) => void) {
    this.messageHandler = handler;
    
    if (this.ws) {
      this.ws.close();
    }

    // Format WebSocket URL for Binance
    const wsEndpoint = `wss://stream.binance.com:9443/ws/${this.wsUrl}`;
    this.ws = new WebSocket(wsEndpoint);

    this.ws.onopen = () => {
      console.log('WebSocket Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Subscribe to the kline stream
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const subscribeMessage = {
          method: 'SUBSCRIBE',
          params: [`${this.symbol}@kline_${this.wsUrl}`],
          id: 1
        };
        this.ws.send(JSON.stringify(subscribeMessage));
      }
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.k) { // Kline data
        const kline = data.k;
        const processedData = {
          time: new Date(kline.t).toLocaleTimeString(),
          timestamp: kline.t,
          open: parseFloat(kline.o),
          high: parseFloat(kline.h),
          low: parseFloat(kline.l),
          close: parseFloat(kline.c),
          volume: parseFloat(kline.v),
          isComplete: kline.x,
          interval: kline.i,
          firstTrade: kline.f,
          lastTrade: kline.L,
          symbol: kline.s
        };

        // Update or create new candle
        if (this.lastCandle && this.lastCandle.timestamp === processedData.timestamp) {
          // Update existing candle
          this.lastCandle = {
            ...this.lastCandle,
            close: processedData.close,
            high: Math.max(this.lastCandle.high, processedData.high),
            low: Math.min(this.lastCandle.low, processedData.low),
            volume: processedData.volume
          };
          
          if (processedData.isComplete) {
            // Candle is complete, send final update
            if (this.messageHandler) {
              this.messageHandler({
                ...this.lastCandle,
                isComplete: true
              });
            }
            this.lastCandle = null;
          } else if (this.messageHandler) {
            // Send interim update
            this.messageHandler(this.lastCandle);
          }
        } else {
          // New candle
          if (this.lastCandle && !this.lastCandle.isComplete && this.messageHandler) {
            // Complete the previous candle if it exists
            this.messageHandler({
              ...this.lastCandle,
              isComplete: true
            });
          }
          this.lastCandle = processedData;
          if (this.messageHandler) {
            this.messageHandler(processedData);
          }
        }
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

    let lastPrice = 50000; // Starting mock price
    let lastTime = Date.now();
    let lastVolume = 1000;

    this.mockDataInterval = setInterval(() => {
      const now = Date.now();
      const change = (Math.random() - 0.5) * 100;
      const newPrice = lastPrice + change;
      const volumeChange = (Math.random() - 0.5) * 200;
      const newVolume = Math.max(0, lastVolume + volumeChange);
      
      const mockData = {
        time: new Date(now).toLocaleTimeString(),
        timestamp: now,
        open: lastPrice,
        close: newPrice,
        high: Math.max(lastPrice, newPrice) + Math.random() * 20,
        low: Math.min(lastPrice, newPrice) - Math.random() * 20,
        volume: newVolume,
        isComplete: now - lastTime >= 60000,
        interval: this.wsUrl,
        firstTrade: now - 60000,
        lastTrade: now,
        symbol: this.symbol
      };

      if (mockData.isComplete) {
        lastTime = now;
      }

      lastPrice = newPrice;
      lastVolume = newVolume;
      
      if (this.messageHandler) {
        this.messageHandler(mockData);
      }
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
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)); // Exponential backoff
    } else {
      console.log('Max reconnection attempts reached, falling back to mock data');
      this.startMockDataFeed();
    }
  }

  public disconnect() {
    this.stopMockDataFeed();

    if (this.ws) {
      if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
        try {
          const unsubscribeMessage = {
            method: 'UNSUBSCRIBE',
            params: [`${this.symbol}@kline_${this.wsUrl}`],
            id: 1
          };
          this.ws.send(JSON.stringify(unsubscribeMessage));
        } catch (error) {
          console.error('Error sending unsubscribe message:', error);
        }
      }
      
      try {
        this.ws.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      
      this.ws = null;
      this.isConnected = false;
      this.lastCandle = null;
    }
  }

  public changeSymbol(symbol: string) {
    this.symbol = symbol;
    this.reconnectAttempts = 0;
    this.lastCandle = null;
    if (this.messageHandler) {
      this.disconnect();
      this.connect(this.messageHandler);
    }
  }

  public changeInterval(interval: string) {
    this.wsUrl = interval;
    this.reconnectAttempts = 0;
    this.lastCandle = null;
    if (this.messageHandler) {
      this.disconnect();
      this.connect(this.messageHandler);
    }
  }
}