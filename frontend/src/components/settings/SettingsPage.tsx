import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Code,
  Help,
  Info,
  Gavel,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { setLanguage, toggleTheme } from '../../store/slices/uiSlice';
import { authAPI } from '../../services/api';

import ProfileSettings from './ProfileSettings';
import NotificationsSettings from './NotificationsSettings';
import SecuritySettings from './SecuritySettings';
import APISettings from './APISettings';
import PreferencesSettings from './PreferencesSettings';
import PrivacySettings from './PrivacySettings';
import HelpSupport from './HelpSupport';
import About from './About';
import Legal from './Legal';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { theme, language } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = [
    {
      label: t('settings.profile'),
      icon: <Person />,
      component: <ProfileSettings />,
    },
    {
      label: t('settings.notifications'),
      icon: <Notifications />,
      component: <NotificationsSettings />,
    },
    {
      label: t('settings.security'),
      icon: <Security />,
      component: <SecuritySettings />,
    },
    {
      label: t('settings.api'),
      icon: <Code />,
      component: <APISettings />,
    },
    {
      label: t('settings.preferences'),
      icon: <Person />,
      component: <PreferencesSettings />,
    },
    {
      label: t('settings.privacy'),
      icon: <Security />,
      component: <PrivacySettings />,
    },
    {
      label: t('help.title'),
      icon: <Help />,
      component: <HelpSupport />,
    },
    {
      label: t('about.title'),
      icon: <Info />,
      component: <About />,
    },
    {
      label: t('legal.title'),
      icon: <Gavel />,
      component: <Legal />,
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Paper>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons="auto"
              aria-label="settings tabs"
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  id={`settings-tab-${index}`}
                  aria-controls={`settings-tabpanel-${index}`}
                />
              ))}
            </Tabs>
          </Box>

          {tabs.map((tab, index) => (
            <TabPanel key={index} value={value} index={index}>
              {tab.component}
            </TabPanel>
          ))}
        </Paper>
      </Grid>
    </Grid>
  );
};

export default SettingsPage; 