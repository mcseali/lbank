import React from 'react';
import { Grid } from '@mui/material';
import TradingView from './TradingView';
import OrderForm from './OrderForm';
import MarketAnalysis from './MarketAnalysis';
import PositionsList from './PositionsList';
import TradesList from './TradesList';

const TradingPage: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <TradingView />
      </Grid>
      <Grid item xs={12} md={4}>
        <OrderForm />
      </Grid>
      <Grid item xs={12}>
        <MarketAnalysis />
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

export default TradingPage; 