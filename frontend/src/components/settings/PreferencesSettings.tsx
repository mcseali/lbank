import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';

const PreferencesSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [preferences, setPreferences] = useState({
    theme: user?.settings?.theme || 'light',
    language: user?.settings?.language || 'en',
    timezone: user?.settings?.timezone || 'UTC',
    dateFormat: user?.settings?.dateFormat || 'MM/DD/YYYY',
    numberFormat: user?.settings?.numberFormat || 'en-US',
    defaultCurrency: user?.settings?.defaultCurrency || 'USD',
    defaultTradingPair: user?.settings?.defaultTradingPair || 'BTC/USDT',
    defaultOrderType: user?.settings?.defaultOrderType || 'market',
    defaultOrderSize: user?.settings?.defaultOrderSize || '0.001',
    showOrderBook: user?.settings?.showOrderBook || true,
    showTradeHistory: user?.settings?.showTradeHistory || true,
    showMarketDepth: user?.settings?.showMarketDepth || true,
    showTechnicalIndicators: user?.settings?.showTechnicalIndicators || true,
    showPriceAlerts: user?.settings?.showPriceAlerts || true,
    showVolumeProfile: user?.settings?.showVolumeProfile || true,
    showTimeAndSales: user?.settings?.showTimeAndSales || true,
    showMarketOverview: user?.settings?.showMarketOverview || true,
    showPortfolioSummary: user?.settings?.showPortfolioSummary || true,
    showOpenOrders: user?.settings?.showOpenOrders || true,
    showClosedOrders: user?.settings?.showClosedOrders || true,
    showPositions: user?.settings?.showPositions || true,
    showTrades: user?.settings?.showTrades || true,
    showBalance: user?.settings?.showBalance || true,
    showDepositWithdraw: user?.settings?.showDepositWithdraw || true,
    showAPIKeys: user?.settings?.showAPIKeys || true,
    showSecurity: user?.settings?.showSecurity || true,
    showNotifications: user?.settings?.showNotifications || true,
    showSettings: user?.settings?.showSettings || true,
    showHelp: user?.settings?.showHelp || true,
    showAbout: user?.settings?.showAbout || true,
    showLegal: user?.settings?.showLegal || true,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authAPI.updateUserSettings(preferences);
      setSuccess(t('settings.updateSuccess'));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.updateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('settings.preferences')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="subtitle1" gutterBottom>
          {t('settings.appearance')}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('settings.theme')}</InputLabel>
          <Select
            name="theme"
            value={preferences.theme}
            onChange={handleSelectChange}
            label={t('settings.theme')}
          >
            <MenuItem value="light">{t('settings.themeLight')}</MenuItem>
            <MenuItem value="dark">{t('settings.themeDark')}</MenuItem>
            <MenuItem value="system">{t('settings.themeSystem')}</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('settings.language')}</InputLabel>
          <Select
            name="language"
            value={preferences.language}
            onChange={handleSelectChange}
            label={t('settings.language')}
          >
            <MenuItem value="en">{t('settings.languageEnglish')}</MenuItem>
            <MenuItem value="es">{t('settings.languageSpanish')}</MenuItem>
            <MenuItem value="fr">{t('settings.languageFrench')}</MenuItem>
            <MenuItem value="de">{t('settings.languageGerman')}</MenuItem>
            <MenuItem value="it">{t('settings.languageItalian')}</MenuItem>
            <MenuItem value="pt">{t('settings.languagePortuguese')}</MenuItem>
            <MenuItem value="ru">{t('settings.languageRussian')}</MenuItem>
            <MenuItem value="zh">{t('settings.languageChinese')}</MenuItem>
            <MenuItem value="ja">{t('settings.languageJapanese')}</MenuItem>
            <MenuItem value="ko">{t('settings.languageKorean')}</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          {t('settings.trading')}
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('settings.defaultTradingPair')}</InputLabel>
          <Select
            name="defaultTradingPair"
            value={preferences.defaultTradingPair}
            onChange={handleSelectChange}
            label={t('settings.defaultTradingPair')}
          >
            <MenuItem value="BTC/USDT">BTC/USDT</MenuItem>
            <MenuItem value="ETH/USDT">ETH/USDT</MenuItem>
            <MenuItem value="BNB/USDT">BNB/USDT</MenuItem>
            <MenuItem value="XRP/USDT">XRP/USDT</MenuItem>
            <MenuItem value="ADA/USDT">ADA/USDT</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>{t('settings.defaultOrderType')}</InputLabel>
          <Select
            name="defaultOrderType"
            value={preferences.defaultOrderType}
            onChange={handleSelectChange}
            label={t('settings.defaultOrderType')}
          >
            <MenuItem value="market">{t('settings.orderTypeMarket')}</MenuItem>
            <MenuItem value="limit">{t('settings.orderTypeLimit')}</MenuItem>
            <MenuItem value="stop">{t('settings.orderTypeStop')}</MenuItem>
            <MenuItem value="stopLimit">{t('settings.orderTypeStopLimit')}</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          name="defaultOrderSize"
          label={t('settings.defaultOrderSize')}
          value={preferences.defaultOrderSize}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              defaultOrderSize: e.target.value,
            }))
          }
          sx={{ mb: 2 }}
        />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          {t('settings.display')}
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={preferences.showOrderBook}
                onChange={handleChange}
                name="showOrderBook"
              />
            }
            label={t('settings.showOrderBook')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showTradeHistory}
                onChange={handleChange}
                name="showTradeHistory"
              />
            }
            label={t('settings.showTradeHistory')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showMarketDepth}
                onChange={handleChange}
                name="showMarketDepth"
              />
            }
            label={t('settings.showMarketDepth')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showTechnicalIndicators}
                onChange={handleChange}
                name="showTechnicalIndicators"
              />
            }
            label={t('settings.showTechnicalIndicators')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showPriceAlerts}
                onChange={handleChange}
                name="showPriceAlerts"
              />
            }
            label={t('settings.showPriceAlerts')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showVolumeProfile}
                onChange={handleChange}
                name="showVolumeProfile"
              />
            }
            label={t('settings.showVolumeProfile')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showTimeAndSales}
                onChange={handleChange}
                name="showTimeAndSales"
              />
            }
            label={t('settings.showTimeAndSales')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showMarketOverview}
                onChange={handleChange}
                name="showMarketOverview"
              />
            }
            label={t('settings.showMarketOverview')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showPortfolioSummary}
                onChange={handleChange}
                name="showPortfolioSummary"
              />
            }
            label={t('settings.showPortfolioSummary')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showOpenOrders}
                onChange={handleChange}
                name="showOpenOrders"
              />
            }
            label={t('settings.showOpenOrders')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showClosedOrders}
                onChange={handleChange}
                name="showClosedOrders"
              />
            }
            label={t('settings.showClosedOrders')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showPositions}
                onChange={handleChange}
                name="showPositions"
              />
            }
            label={t('settings.showPositions')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showTrades}
                onChange={handleChange}
                name="showTrades"
              />
            }
            label={t('settings.showTrades')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showBalance}
                onChange={handleChange}
                name="showBalance"
              />
            }
            label={t('settings.showBalance')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showDepositWithdraw}
                onChange={handleChange}
                name="showDepositWithdraw"
              />
            }
            label={t('settings.showDepositWithdraw')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showAPIKeys}
                onChange={handleChange}
                name="showAPIKeys"
              />
            }
            label={t('settings.showAPIKeys')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showSecurity}
                onChange={handleChange}
                name="showSecurity"
              />
            }
            label={t('settings.showSecurity')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showNotifications}
                onChange={handleChange}
                name="showNotifications"
              />
            }
            label={t('settings.showNotifications')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showSettings}
                onChange={handleChange}
                name="showSettings"
              />
            }
            label={t('settings.showSettings')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showHelp}
                onChange={handleChange}
                name="showHelp"
              />
            }
            label={t('settings.showHelp')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showAbout}
                onChange={handleChange}
                name="showAbout"
              />
            }
            label={t('settings.showAbout')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={preferences.showLegal}
                onChange={handleChange}
                name="showLegal"
              />
            }
            label={t('settings.showLegal')}
          />
        </FormGroup>

        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : t('settings.save')}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreferencesSettings; 