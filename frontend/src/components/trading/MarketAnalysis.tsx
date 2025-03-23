import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { RootState } from '../../store';
import { tradingAPI } from '../../services/api';
import { setMarketAnalysis } from '../../store/slices/tradingSlice';

const MarketAnalysis: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { selectedSymbol, selectedTimeframe, marketAnalysis, loading, error } = useSelector(
    (state: RootState) => state.trading
  );

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!selectedSymbol) return;

      try {
        const response = await tradingAPI.getMarketAnalysis(selectedSymbol, selectedTimeframe);
        dispatch(setMarketAnalysis(response.data));
      } catch (err) {
        console.error('Error fetching market analysis:', err);
      }
    };

    fetchAnalysis();
  }, [dispatch, selectedSymbol, selectedTimeframe]);

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

  if (!marketAnalysis) {
    return (
      <Paper sx={{ p: 2, m: 2 }}>
        <Typography>{t('trading.selectSymbol')}</Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('trading.technicalAnalysis')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('trading.trend')}
                  </Typography>
                  <Chip
                    label={t(`trading.${marketAnalysis.trend}`)}
                    color={marketAnalysis.trend === 'bullish' ? 'success' : 'error'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('trading.momentum')}
                  </Typography>
                  <Chip
                    label={t(`trading.${marketAnalysis.momentum}`)}
                    color={marketAnalysis.momentum === 'strong' ? 'success' : 'warning'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('trading.volatility')}
                  </Typography>
                  <Chip
                    label={t(`trading.${marketAnalysis.volatility}`)}
                    color={marketAnalysis.volatility === 'high' ? 'error' : 'success'}
                    size="small"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    {t('trading.support')}
                  </Typography>
                  <Typography variant="body1">
                    {marketAnalysis.supportLevels.join(', ')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('trading.aiAnalysis')}
          </Typography>
          <Typography variant="body1" paragraph>
            {marketAnalysis.aiAnalysis}
          </Typography>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('trading.indicators')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    RSI
                  </Typography>
                  <Typography variant="body1">
                    {marketAnalysis.indicators.rsi.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    MACD
                  </Typography>
                  <Typography variant="body1">
                    {marketAnalysis.indicators.macd.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    BB
                  </Typography>
                  <Typography variant="body1">
                    {marketAnalysis.indicators.bb.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Stochastic RSI
                  </Typography>
                  <Typography variant="body1">
                    {marketAnalysis.indicators.stochasticRsi.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default MarketAnalysis; 