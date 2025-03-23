import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { tradingAPI } from '../../services/api';

declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingView: React.FC = () => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const { selectedSymbol, selectedTimeframe } = useSelector((state: RootState) => state.trading);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    const loadTradingView = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load TradingView library
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          if (containerRef.current && selectedSymbol) {
            new window.TradingView.widget({
              container_id: containerRef.current.id,
              symbol: selectedSymbol,
              interval: selectedTimeframe,
              theme: 'dark',
              locale: 'fa_IR',
              toolbar_bg: '#f1f3f6',
              enable_publishing: false,
              allow_symbol_change: true,
              save_image: false,
              studies: [
                'RSI@tv-basicstudies',
                'MACD@tv-basicstudies',
                'BB@tv-basicstudies',
                'StochasticRSI@tv-basicstudies',
              ],
            });
          }
          setLoading(false);
        };
        document.head.appendChild(script);
      } catch (err: any) {
        setError(err.message || t('trading.chartError'));
        setLoading(false);
      }
    };

    if (selectedSymbol) {
      loadTradingView();
    }
  }, [selectedSymbol, selectedTimeframe, t]);

  return (
    <Paper sx={{ p: 2, height: '100%', minHeight: 500 }}>
      <Typography variant="h6" gutterBottom>
        {t('trading.chart')}
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Box
        ref={containerRef}
        id="tradingview_chart"
        sx={{
          height: 'calc(100% - 48px)',
          minHeight: 400,
          position: 'relative',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TradingView; 