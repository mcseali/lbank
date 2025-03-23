import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff, ContentCopy, Delete } from '@mui/icons-material';
import { RootState } from '../../store';
import { authAPI } from '../../services/api';

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdAt: string;
}

const APISettings: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);

  const [apiKeys, setApiKeys] = useState<APIKey[]>(user?.apiKeys || []);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) {
      setError(t('settings.apiKeyNameRequired'));
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.createAPIKey(newKeyName);
      setApiKeys((prev) => [...prev, response]);
      setSuccess(t('settings.apiKeyCreated'));
      setOpenDialog(false);
      setNewKeyName('');
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.apiKeyCreateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    setLoading(true);
    try {
      await authAPI.deleteAPIKey(keyId);
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
      setSuccess(t('settings.apiKeyDeleted'));
    } catch (err: any) {
      setError(err.response?.data?.detail || t('settings.apiKeyDeleteError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setSuccess(t('settings.apiKeyCopied'));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {t('settings.apiKeys')}
        </Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          disabled={loading}
        >
          {t('settings.createAPIKey')}
        </Button>
      </Box>

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

      <Grid container spacing={2}>
        {apiKeys.map((apiKey) => (
          <Grid item xs={12} key={apiKey.id}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1">{apiKey.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(apiKey.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box>
                  <Tooltip title={showKey === apiKey.id ? t('settings.hideKey') : t('settings.showKey')}>
                    <IconButton
                      onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)}
                    >
                      {showKey === apiKey.id ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('settings.copyKey')}>
                    <IconButton onClick={() => handleCopyKey(apiKey.key)}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('settings.deleteKey')}>
                    <IconButton
                      onClick={() => handleDeleteKey(apiKey.id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
              {showKey === apiKey.id && (
                <TextField
                  fullWidth
                  value={apiKey.key}
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mt: 1 }}
                />
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t('settings.createAPIKey')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={t('settings.apiKeyName')}
            fullWidth
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleCreateKey}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default APISettings; 