import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { RootState } from '../../store';
import { tradingAPI } from '../../services/api';
import { setTrades } from '../../store/slices/tradingSlice';

const TradesList: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { trades, loading, error } = useSelector((state: RootState) => state.trading);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await tradingAPI.getTrades();
        dispatch(setTrades(response.data));
      } catch (err) {
        console.error('Error fetching trades:', err);
      }
    };

    fetchTrades();
  }, [dispatch]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  if (trades.length === 0) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography>{t('trading.noTrades')}</Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('trading.symbol')}</TableCell>
            <TableCell>{t('trading.side')}</TableCell>
            <TableCell align="right">{t('trading.quantity')}</TableCell>
            <TableCell align="right">{t('trading.price')}</TableCell>
            <TableCell align="right">{t('trading.total')}</TableCell>
            <TableCell align="right">{t('trading.fee')}</TableCell>
            <TableCell align="right">{t('trading.time')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell>{trade.symbol}</TableCell>
              <TableCell>
                <Chip
                  label={t(`trading.${trade.side}`)}
                  color={trade.side === 'buy' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{trade.quantity}</TableCell>
              <TableCell align="right">{trade.price}</TableCell>
              <TableCell align="right">{trade.total}</TableCell>
              <TableCell align="right">{trade.fee}</TableCell>
              <TableCell align="right">
                {new Date(trade.timestamp).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TradesList; 