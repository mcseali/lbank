import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const PortfolioSummary: React.FC = () => {
  const { t } = useTranslation();
  const { positions } = useSelector((state: RootState) => state.trading);

  const totalValue = positions.reduce((sum, position) => sum + position.currentValue, 0);
  const totalPnL = positions.reduce((sum, position) => sum + position.pnl, 0);
  const pnlPercentage = (totalPnL / totalValue) * 100;

  const assetDistribution = positions.reduce((acc, position) => {
    const asset = position.symbol.split('/')[0];
    acc[asset] = (acc[asset] || 0) + position.currentValue;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              {t('portfolio.totalValue')}
            </Typography>
            <Typography variant="h4">
              ${totalValue.toFixed(2)}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              {t('portfolio.totalPnL')}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: pnlPercentage >= 0 ? 'success.main' : 'error.main',
              }}
            >
              {pnlPercentage >= 0 ? '+' : ''}
              ${totalPnL.toFixed(2)}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: pnlPercentage >= 0 ? 'success.main' : 'error.main',
              }}
            >
              {pnlPercentage >= 0 ? '+' : ''}
              {pnlPercentage.toFixed(2)}%
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              {t('portfolio.openPositions')}
            </Typography>
            <Typography variant="h4">
              {positions.length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('portfolio.assetDistribution')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {Object.entries(assetDistribution).map(([asset, value]) => (
              <Chip
                key={asset}
                label={`${asset}: ${((value / totalValue) * 100).toFixed(1)}%`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default PortfolioSummary; 