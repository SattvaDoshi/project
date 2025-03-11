export interface ChartData {
  categoryData: string[];
  values: [number, number, number, number][];  // [open, close, low, high]
  volumes: number[];
  itemStyle: {
    color: string;
    borderColor: string;
    color0: string;
    borderColor0: string;
  };
}

export interface IndicatorSettings {
  sma: {
    enabled: boolean;
    period: number;
    color: string;
    lineWidth: number;
  };
  ema: {
    enabled: boolean;
    period: number;
    color: string;
    lineWidth: number;
  };
  wma: {
    enabled: boolean;
    period: number;
    color: string;
    lineWidth: number;
  };
  bb: {
    enabled: boolean;
    period: number;
    stdDev: number;
    color: string;
    lineWidth: number;
  };
  vwap: {
    enabled: boolean;
    color: string;
    lineWidth: number;
  };
  volume: {
    enabled: boolean;
    upColor: string;
    downColor: string;
  };
}

export interface DrawingState {
  isDrawing: boolean;
  startPoint: { x: number; y: number } | null;
  currentTrendline: any | null;
  trendlines: any[];
  isDragging: boolean;
  selectedTrendline: string | null;
  dragStartPoint: [number, number] | null;
  dragStartData: any | null;
}

export interface TimeframeConfig {
  interval: string;
  wsUrl: string;
  limit: number;
}

export interface Timeframes {
  [key: string]: TimeframeConfig;
}

export interface Candle {
  time: number;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isComplete: boolean;
}

export interface WebSocketMessage {
  e: string;  // Event type
  E: number;  // Event time
  s: string;  // Symbol
  k: {
    t: number;  // Kline start time
    T: number;  // Kline close time
    s: string;  // Symbol
    i: string;  // Interval
    f: number;  // First trade ID
    L: number;  // Last trade ID
    o: string;  // Open price
    c: string;  // Close price
    h: string;  // High price
    l: string;  // Low price
    v: string;  // Base asset volume
    n: number;  // Number of trades
    x: boolean; // Is this kline closed?
    q: string;  // Quote asset volume
    V: string;  // Taker buy base asset volume
    Q: string;  // Taker buy quote asset volume
    B: string;  // Ignore
  };
}

export interface IndicatorSettingsConfig {
  volume: {
    upColor: string;
    downColor: string;
    opacity: number;
  };
  bb: {
    period: number;
    stdDev: number;
    color: string;
    opacity: number;
    width: number;
  };
  superTrend: {
    period: number;
    multiplier: number;
    upColor: string;
    downColor: string;
    width: number;
  };
  vwap: {
    color: string;
    width: number;
    showBands: boolean;
    stdDev: number;
    bandOpacity: number;
    resetPeriod: string;
  };
  ichimoku: {
    tenkanPeriod: number;
    kijunPeriod: number;
    senkouBPeriod: number;
    displacement: number;
    tenkanColor: string;
    kijunColor: string;
    cloudBullColor: string;
    cloudBearColor: string;
    width: number;
  };
  pivots: {
    type: string;
    timeFrame: string;
    pivotColor: string;
    supportColor: string;
    resistanceColor: string;
    width: number;
    showLabels: boolean;
  };
  avwap: {
    color: string;
    width: number;
    anchorDate: number | null;
    showBands: boolean;
    bandOpacity: number;
  };
}

export interface Strategy {
  firstIndicator: string;
  secondIndicator: string;
  condition: string;
  signalColor: string;
  signalSize: string;
}

export interface Signal {
  timestamp: string;
  price: string;
  type: string;
  indicator1: string;
  indicator2: string;
}