import React from 'react';
import { Grid } from '@mui/material';
import PortfolioSummary from './PortfolioSummary';
import PositionsList from '../trading/PositionsList';
import TradesList from '../trading/TradesList';

const PortfolioPage: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <PortfolioSummary />
      </Grid>
      <Grid item xs={12} md={6}>
        <PositionsList />
      </Grid>
      <Grid item xs={12} md={6}>
        <TradesList />
      </Grid>
    </Grid>
  );
};

export default PortfolioPage; 