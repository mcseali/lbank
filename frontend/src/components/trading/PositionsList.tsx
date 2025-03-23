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
  Button,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { RootState } from '../../store';
import { tradingAPI } from '../../services/api';
import { setPositions } from '../../store/slices/tradingSlice';

const PositionsList: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { positions, loading, error } = useSelector((state: RootState) => state.trading);

  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const response = await tradingAPI.getPositions();
        dispatch(setPositions(response.data));
      } catch (err) {
        console.error('Error fetching positions:', err);
      }
    };

    fetchPositions();
  }, [dispatch]);

  const handleClosePosition = async (id: number) => {
    try {
      await tradingAPI.closePosition(id);
      const response = await tradingAPI.getPositions();
      dispatch(setPositions(response.data));
    } catch (err) {
      console.error('Error closing position:', err);
    }
  };

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

  if (positions.length === 0) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography>{t('trading.noPositions')}</Typography>
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
            <TableCell align="right">{t('trading.entryPrice')}</TableCell>
            <TableCell align="right">{t('trading.currentPrice')}</TableCell>
            <TableCell align="right">{t('trading.pnl')}</TableCell>
            <TableCell align="right">{t('trading.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {positions.map((position) => (
            <TableRow key={position.id}>
              <TableCell>{position.symbol}</TableCell>
              <TableCell>
                <Chip
                  label={t(`trading.${position.side}`)}
                  color={position.side === 'buy' ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell align="right">{position.quantity}</TableCell>
              <TableCell align="right">{position.entryPrice}</TableCell>
              <TableCell align="right">{position.currentPrice}</TableCell>
              <TableCell
                align="right"
                sx={{
                  color: position.pnl >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {position.pnl >= 0 ? '+' : ''}
                {position.pnl.toFixed(2)}%
              </TableCell>
              <TableCell align="right">
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => handleClosePosition(position.id)}
                >
                  {t('trading.close')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionsList; 