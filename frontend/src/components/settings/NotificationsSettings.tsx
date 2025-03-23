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
} from '@mui/material';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';

const NotificationsSettings: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [settings, setSettings] = useState({
    emailNotifications: user?.settings?.emailNotifications || false,
    pushNotifications: user?.settings?.pushNotifications || false,
    tradeNotifications: user?.settings?.tradeNotifications || false,
    priceAlerts: user?.settings?.priceAlerts || false,
    newsUpdates: user?.settings?.newsUpdates || false,
    securityAlerts: user?.settings?.securityAlerts || false,
    marketingEmails: user?.settings?.marketingEmails || false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authAPI.updateUserSettings(settings);
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
        {t('settings.notifications')}
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
        <FormGroup>
          <Typography variant="subtitle1" gutterBottom>
            {t('settings.notificationChannels')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications}
                onChange={handleChange}
                name="emailNotifications"
              />
            }
            label={t('settings.emailNotifications')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.pushNotifications}
                onChange={handleChange}
                name="pushNotifications"
              />
            }
            label={t('settings.pushNotifications')}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {t('settings.notificationTypes')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.tradeNotifications}
                onChange={handleChange}
                name="tradeNotifications"
              />
            }
            label={t('settings.tradeNotifications')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.priceAlerts}
                onChange={handleChange}
                name="priceAlerts"
              />
            }
            label={t('settings.priceAlerts')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.newsUpdates}
                onChange={handleChange}
                name="newsUpdates"
              />
            }
            label={t('settings.newsUpdates')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.securityAlerts}
                onChange={handleChange}
                name="securityAlerts"
              />
            }
            label={t('settings.securityAlerts')}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {t('settings.marketing')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.marketingEmails}
                onChange={handleChange}
                name="marketingEmails"
              />
            }
            label={t('settings.marketingEmails')}
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

export default NotificationsSettings; 