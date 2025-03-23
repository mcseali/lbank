import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Position {
  id: number;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entry_price: number;
  current_price: number;
  leverage: number;
  pnl: number;
  is_open: boolean;
}

interface Trade {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  created_at: string;
}

interface MarketAnalysis {
  symbol: string;
  timeframe: string;
  analysis: {
    trend: string;
    momentum: string;
    volatility: string;
    current_price: number;
    rsi: number;
    sma_20: number;
    sma_50: number;
  };
}

interface TradingState {
  positions: Position[];
  trades: Trade[];
  marketAnalysis: MarketAnalysis | null;
  selectedSymbol: string | null;
  selectedTimeframe: string;
  isLoading: boolean;
  error: string | null;
}

const initialState: TradingState = {
  positions: [],
  trades: [],
  marketAnalysis: null,
  selectedSymbol: null,
  selectedTimeframe: '1h',
  isLoading: false,
  error: null,
};

const tradingSlice = createSlice({
  name: 'trading',
  initialState,
  reducers: {
    setPositions: (state, action: PayloadAction<Position[]>) => {
      state.positions = action.payload;
    },
    addPosition: (state, action: PayloadAction<Position>) => {
      state.positions.push(action.payload);
    },
    updatePosition: (state, action: PayloadAction<Position>) => {
      const index = state.positions.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.positions[index] = action.payload;
      }
    },
    removePosition: (state, action: PayloadAction<number>) => {
      state.positions = state.positions.filter((p) => p.id !== action.payload);
    },
    setTrades: (state, action: PayloadAction<Trade[]>) => {
      state.trades = action.payload;
    },
    addTrade: (state, action: PayloadAction<Trade>) => {
      state.trades.unshift(action.payload);
    },
    setMarketAnalysis: (state, action: PayloadAction<MarketAnalysis>) => {
      state.marketAnalysis = action.payload;
    },
    setSelectedSymbol: (state, action: PayloadAction<string>) => {
      state.selectedSymbol = action.payload;
    },
    setSelectedTimeframe: (state, action: PayloadAction<string>) => {
      state.selectedTimeframe = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setPositions,
  addPosition,
  updatePosition,
  removePosition,
  setTrades,
  addTrade,
  setMarketAnalysis,
  setSelectedSymbol,
  setSelectedTimeframe,
  setLoading,
  setError,
} = tradingSlice.actions;

export default tradingSlice.reducer; 