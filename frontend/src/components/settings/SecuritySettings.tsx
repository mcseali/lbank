import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';

const SecuritySettings: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.settings?.twoFactorEnabled || false
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('settings.passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      setSuccess(t('settings.passwordUpdateSuccess'));
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.passwordUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFactorToggle = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (twoFactorEnabled) {
        await authAPI.disableTwoFactor();
      } else {
        await authAPI.enableTwoFactor();
      }
      setTwoFactorEnabled(!twoFactorEnabled);
      setSuccess(
        t(
          twoFactorEnabled
            ? 'settings.twoFactorDisabled'
            : 'settings.twoFactorEnabled'
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.twoFactorUpdateError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('settings.security')}
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

      <Box component="form" onSubmit={handlePasswordChange}>
        <Typography variant="subtitle1" gutterBottom>
          {t('settings.changePassword')}
        </Typography>

        <TextField
          fullWidth
          required
          type="password"
          name="currentPassword"
          label={t('settings.currentPassword')}
          value={formData.currentPassword}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          required
          type="password"
          name="newPassword"
          label={t('settings.newPassword')}
          value={formData.newPassword}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          required
          type="password"
          name="confirmPassword"
          label={t('settings.confirmPassword')}
          value={formData.confirmPassword}
          onChange={handleChange}
          margin="normal"
        />

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          fullWidth
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : t('settings.updatePassword')}
        </Button>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {t('settings.twoFactorAuth')}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={loading}
            />
          }
          label={t('settings.enableTwoFactor')}
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t('settings.twoFactorDescription')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default SecuritySettings; 