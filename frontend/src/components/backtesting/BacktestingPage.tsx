import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { backtestingAPI } from '../../services/api';

interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  trades: Array<{
    timestamp: string;
    symbol: string;
    side: string;
    price: number;
    quantity: number;
    pnl: number;
  }>;
  equityCurve: Array<{
    timestamp: string;
    equity: number;
  }>;
}

const BacktestingPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    startDate: null,
    endDate: null,
    initialCapital: 10000,
    leverage: 1,
    riskPerTrade: 1,
    timeframe: '1h',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null, field: 'startDate' | 'endDate') => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await backtestingAPI.runBacktest(formData);
      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || t('backtesting.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t('backtesting.title')}
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                name="symbol"
                label={t('backtesting.symbol')}
                value={formData.symbol}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>{t('backtesting.timeframe')}</InputLabel>
                <Select
                  name="timeframe"
                  value={formData.timeframe}
                  onChange={handleChange}
                  label={t('backtesting.timeframe')}
                >
                  <MenuItem value="1m">{t('backtesting.timeframes.1m')}</MenuItem>
                  <MenuItem value="5m">{t('backtesting.timeframes.5m')}</MenuItem>
                  <MenuItem value="15m">{t('backtesting.timeframes.15m')}</MenuItem>
                  <MenuItem value="1h">{t('backtesting.timeframes.1h')}</MenuItem>
                  <MenuItem value="4h">{t('backtesting.timeframes.4h')}</MenuItem>
                  <MenuItem value="1d">{t('backtesting.timeframes.1d')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label={t('backtesting.startDate')}
                value={formData.startDate}
                onChange={(date) => handleDateChange(date, 'startDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DatePicker
                label={t('backtesting.endDate')}
                value={formData.endDate}
                onChange={(date) => handleDateChange(date, 'endDate')}
                renderInput={(params) => <TextField {...params} fullWidth required />}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                name="initialCapital"
                label={t('backtesting.initialCapital')}
                value={formData.initialCapital}
                onChange={handleChange}
                error={formData.initialCapital < 1000}
                helperText={formData.initialCapital < 1000 ? t('backtesting.validation.minCapital') : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                name="leverage"
                label={t('backtesting.leverage')}
                value={formData.leverage}
                onChange={handleChange}
                error={formData.leverage > 100}
                helperText={formData.leverage > 100 ? t('backtesting.validation.maxLeverage') : ''}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                required
                type="number"
                name="riskPerTrade"
                label={t('backtesting.riskPerTrade')}
                value={formData.riskPerTrade}
                onChange={handleChange}
                error={formData.riskPerTrade < 0.1 || formData.riskPerTrade > 5}
                helperText={
                  formData.riskPerTrade < 0.1
                    ? t('backtesting.validation.minRisk')
                    : formData.riskPerTrade > 5
                    ? t('backtesting.validation.maxRisk')
                    : ''
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : t('backtesting.run')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {result && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('backtesting.results')}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">{t('backtesting.totalTrades')}</Typography>
                <Typography variant="h6">{result.totalTrades}</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">{t('backtesting.winRate')}</Typography>
                <Typography variant="h6">{result.winRate.toFixed(2)}%</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">{t('backtesting.totalProfit')}</Typography>
                <Typography variant="h6" color={result.totalProfit >= 0 ? 'success.main' : 'error.main'}>
                  ${result.totalProfit.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="subtitle2">{t('backtesting.maxDrawdown')}</Typography>
                <Typography variant="h6" color="error.main">
                  {result.maxDrawdown.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('backtesting.equityCurve')}
            </Typography>
            <Box sx={{ height: 400 }}>
              <LineChart
                width={800}
                height={400}
                data={result.equityCurve}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="equity" stroke="#8884d8" />
              </LineChart>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('backtesting.trades')}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('backtesting.timestamp')}</TableCell>
                    <TableCell>{t('backtesting.symbol')}</TableCell>
                    <TableCell>{t('backtesting.side')}</TableCell>
                    <TableCell align="right">{t('backtesting.price')}</TableCell>
                    <TableCell align="right">{t('backtesting.quantity')}</TableCell>
                    <TableCell align="right">{t('backtesting.pnl')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.trades.map((trade, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(trade.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{trade.symbol}</TableCell>
                      <TableCell>{trade.side}</TableCell>
                      <TableCell align="right">${trade.price.toFixed(2)}</TableCell>
                      <TableCell align="right">{trade.quantity.toFixed(4)}</TableCell>
                      <TableCell align="right" sx={{ color: trade.pnl >= 0 ? 'success.main' : 'error.main' }}>
                        ${trade.pnl.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BacktestingPage; 