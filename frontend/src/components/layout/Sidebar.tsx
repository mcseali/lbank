import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  Typography,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShowChart as ShowChartIcon,
  AccountBalance as AccountBalanceIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';

const drawerWidth = 240;

const menuItems = [
  { path: '/', icon: <DashboardIcon />, translationKey: 'menu.dashboard' },
  { path: '/trading', icon: <ShowChartIcon />, translationKey: 'menu.trading' },
  { path: '/portfolio', icon: <AccountBalanceIcon />, translationKey: 'menu.portfolio' },
  { path: '/settings', icon: <SettingsIcon />, translationKey: 'menu.settings' },
  { path: '/help', icon: <HelpIcon />, translationKey: 'menu.help' },
];

const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={sidebarOpen}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 8 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" noWrap component="div">
            {t('app.name')}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigation(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={t(item.translationKey)} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 