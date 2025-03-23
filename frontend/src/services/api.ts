import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/token', { username, password }),
  register: (username: string, email: string, password: string) =>
    api.post('/users/', { username, email, password }),
  getCurrentUser: () => api.get('/users/me'),
  updateUser: (data: any) => api.put('/users/me', data),
};

// API Key endpoints
export const apiKeyAPI = {
  create: (data: any) => api.post('/api-keys/', data),
  list: () => api.get('/api-keys/'),
  delete: (id: number) => api.delete(`/api-keys/${id}`),
};

// Trading endpoints
export const tradingAPI = {
  getTradingPairs: () => api.get('/trading/pairs'),
  getCandlesticks: (symbol: string, timeframe: string) =>
    api.get(`/trading/candlesticks/${symbol}`, { params: { timeframe } }),
  getMarketAnalysis: (symbol: string, timeframe: string) =>
    api.get(`/trading/analysis/${symbol}`, { params: { timeframe } }),
  executeTrade: (data: any) => api.post('/trading/trade', data),
  getPositions: () => api.get('/trading/positions'),
  closePosition: (id: number) => api.post(`/trading/positions/${id}/close`),
  getTrades: () => api.get('/trading/trades'),
};

// Backtesting endpoints
export const backtestingAPI = {
  runBacktest: (data: {
    symbol: string;
    startDate: Date | null;
    endDate: Date | null;
    initialCapital: number;
    leverage: number;
    riskPerTrade: number;
    timeframe: string;
  }) => api.post('/backtesting/run', data),
};

export default api; 