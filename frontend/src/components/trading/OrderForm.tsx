import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { RootState } from '../../store';
import { tradingAPI } from '../../services/api';
import { addTrade } from '../../store/slices/tradingSlice';

interface OrderFormData {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price?: string;
}

const OrderForm: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { selectedSymbol, selectedTimeframe } = useSelector((state: RootState) => state.trading);
  const [formData, setFormData] = useState<OrderFormData>({
    symbol: selectedSymbol || '',
    side: 'buy',
    type: 'market',
    quantity: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    if (selectedSymbol) {
      setFormData((prev) => ({ ...prev, symbol: selectedSymbol }));
    }
  }, [selectedSymbol]);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (formData.symbol) {
        try {
          const response = await tradingAPI.getCandlesticks(formData.symbol, selectedTimeframe);
          const lastCandle = response.data[response.data.length - 1];
          setCurrentPrice(lastCandle.close);
        } catch (err) {
          console.error('Error fetching current price:', err);
        }
      }
    };

    fetchCurrentPrice();
  }, [formData.symbol, selectedTimeframe]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.symbol) {
      setError(t('trading.selectSymbol'));
      return false;
    }
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      setError(t('trading.invalidQuantity'));
      return false;
    }
    if (formData.type === 'limit' && (!formData.price || parseFloat(formData.price) <= 0)) {
      setError(t('trading.invalidPrice'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await tradingAPI.executeTrade(formData);
      dispatch(addTrade(response.data));
      setFormData((prev) => ({
        ...prev,
        quantity: '',
        price: '',
      }));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('trading.orderError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('trading.newOrder')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>{t('trading.symbol')}</InputLabel>
              <Select
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                label={t('trading.symbol')}
              >
                <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
                <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
                <MenuItem value="BNB/USDT">BNB/USDT</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('trading.side')}</InputLabel>
              <Select
                name="side"
                value={formData.side}
                onChange={handleChange}
                label={t('trading.side')}
              >
                <MenuItem value="buy">{t('trading.buy')}</MenuItem>
                <MenuItem value="sell">{t('trading.sell')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>{t('trading.type')}</InputLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                label={t('trading.type')}
              >
                <MenuItem value="market">{t('trading.market')}</MenuItem>
                <MenuItem value="limit">{t('trading.limit')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              name="quantity"
              label={t('trading.quantity')}
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              inputProps={{ min: 0, step: 0.00000001 }}
            />
          </Grid>

          {formData.type === 'limit' && (
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="price"
                label={t('trading.price')}
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.00000001 }}
              />
            </Grid>
          )}

          {currentPrice && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {t('trading.currentPrice')}: {currentPrice.toFixed(8)}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : t('trading.placeOrder')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default OrderForm; 