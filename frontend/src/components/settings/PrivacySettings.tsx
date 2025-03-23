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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';

const PrivacySettings: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [settings, setSettings] = useState({
    showProfile: user?.settings?.showProfile || false,
    showBalance: user?.settings?.showBalance || false,
    showTrades: user?.settings?.showTrades || false,
    showOrders: user?.settings?.showOrders || false,
    showPositions: user?.settings?.showPositions || false,
    showPortfolio: user?.settings?.showPortfolio || false,
    showActivity: user?.settings?.showActivity || false,
    showNotifications: user?.settings?.showNotifications || false,
    showAPIKeys: user?.settings?.showAPIKeys || false,
    showSecurity: user?.settings?.showSecurity || false,
    showSettings: user?.settings?.showSettings || false,
    showHelp: user?.settings?.showHelp || false,
    showAbout: user?.settings?.showAbout || false,
    showLegal: user?.settings?.showLegal || false,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== user?.username) {
      setError(t('settings.deleteConfirmationError'));
      return;
    }

    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authAPI.deleteAccount();
      setSuccess(t('settings.accountDeleted'));
      // Redirect to login page or handle logout
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.deleteAccountError'));
    } finally {
      setLoading(false);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('settings.privacy')}
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
            {t('settings.profileVisibility')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showProfile}
                onChange={handleChange}
                name="showProfile"
              />
            }
            label={t('settings.showProfile')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showBalance}
                onChange={handleChange}
                name="showBalance"
              />
            }
            label={t('settings.showBalance')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showTrades}
                onChange={handleChange}
                name="showTrades"
              />
            }
            label={t('settings.showTrades')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showOrders}
                onChange={handleChange}
                name="showOrders"
              />
            }
            label={t('settings.showOrders')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showPositions}
                onChange={handleChange}
                name="showPositions"
              />
            }
            label={t('settings.showPositions')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showPortfolio}
                onChange={handleChange}
                name="showPortfolio"
              />
            }
            label={t('settings.showPortfolio')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showActivity}
                onChange={handleChange}
                name="showActivity"
              />
            }
            label={t('settings.showActivity')}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {t('settings.notificationVisibility')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showNotifications}
                onChange={handleChange}
                name="showNotifications"
              />
            }
            label={t('settings.showNotifications')}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" gutterBottom>
            {t('settings.settingsVisibility')}
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.showAPIKeys}
                onChange={handleChange}
                name="showAPIKeys"
              />
            }
            label={t('settings.showAPIKeys')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showSecurity}
                onChange={handleChange}
                name="showSecurity"
              />
            }
            label={t('settings.showSecurity')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showSettings}
                onChange={handleChange}
                name="showSettings"
              />
            }
            label={t('settings.showSettings')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showHelp}
                onChange={handleChange}
                name="showHelp"
              />
            }
            label={t('settings.showHelp')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showAbout}
                onChange={handleChange}
                name="showAbout"
              />
            }
            label={t('settings.showAbout')}
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.showLegal}
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

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom color="error">
          {t('settings.dangerZone')}
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={() => setOpenDeleteDialog(true)}
        >
          {t('settings.deleteAccount')}
        </Button>
      </Box>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>{t('settings.deleteAccount')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('settings.deleteAccountWarning')}
          </Typography>
          <TextField
            fullWidth
            label={t('settings.deleteConfirmation')}
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            helperText={t('settings.deleteConfirmationHelper')}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            disabled={loading || deleteConfirmation !== user?.username}
          >
            {loading ? <CircularProgress size={24} /> : t('settings.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PrivacySettings; 