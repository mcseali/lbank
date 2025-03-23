import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Autocomplete,
  InputAdornment,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { TradingViewEmbed, widgetType } from 'react-tradingview-embed';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import APIKeyManager from './components/APIKeyManager';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';

// کامپوننت محافظت از مسیر
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

const App = () => {
  const [symbol, setSymbol] = useState('');
  const [leverage, setLeverage] = useState(1);
  const [positionSize, setPositionSize] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tradingPairs, setTradingPairs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPair, setSelectedPair] = useState('');
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    fetchPositions();
    fetchTradingPairs();
  }, []);

  const fetchTradingPairs = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/trading-pairs`);
      setTradingPairs(response.data);
    } catch (err) {
      setError('خطا در دریافت لیست جفت ارزها');
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/positions`);
      setPositions(response.data);
    } catch (err) {
      setError('خطا در دریافت موقعیت‌ها');
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_BASE_URL}/analyze`, { symbol });
      setAnalysis(response.data);
      setSuccess(`تحلیل کامل: ${response.data.recommendation === 'BUY' ? 'خرید' : 'فروش'} با اطمینان ${response.data.confidence}%`);
    } catch (err) {
      setError('خطا در تحلیل بازار');
    } finally {
      setLoading(false);
    }
  };

  const handleTrade = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_BASE_URL}/trade`, {
        symbol,
        leverage: parseInt(leverage),
        position_size: parseFloat(positionSize),
        stop_loss_percentage: parseFloat(stopLoss),
        take_profit_percentage: parseFloat(takeProfit),
      });
      setSuccess('معامله با موفقیت انجام شد');
      fetchPositions();
    } catch (err) {
      setError('خطا در اجرای معامله');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePosition = async (positionId) => {
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API_BASE_URL}/close-position/${positionId}`);
      setSuccess('موقعیت با موفقیت بسته شد');
      fetchPositions();
    } catch (err) {
      setError('خطا در بستن موقعیت');
    } finally {
      setLoading(false);
    }
  };

  const handlePairSelect = async (symbol) => {
    setSelectedPair(symbol);
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, { symbol });
      setAnalysis(response.data);
    } catch (err) {
      setError('خطا در تحلیل بازار');
    }
    setLoading(false);
  };

  const filteredTradingPairs = tradingPairs.filter(pair =>
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.base_asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.quote_asset.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 