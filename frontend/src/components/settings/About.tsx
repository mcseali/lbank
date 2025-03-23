import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Info as InfoIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Update as UpdateIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Telegram as TelegramIcon,
} from '@mui/icons-material';

const About: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('about.title')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          {t('about.description')}
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('about.features')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.feature1')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.feature2')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SupportIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.feature3')} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('about.technology')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CodeIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.tech1')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.tech2')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SpeedIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.tech3')} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('about.updates')}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <UpdateIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.update1')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <InfoIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.update2')} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SupportIcon />
                    </ListItemIcon>
                    <ListItemText primary={t('about.update3')} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('about.version')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('about.versionInfo')}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('about.team')}
        </Typography>
        <Typography variant="body1" paragraph>
          {t('about.teamDescription')}
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {t('about.connect')}
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <GitHubIcon />
            </ListItemIcon>
            <ListItemText
              primary="GitHub"
              secondary={
                <Link href="#" underline="hover">
                  github.com/example
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <TwitterIcon />
            </ListItemIcon>
            <ListItemText
              primary="Twitter"
              secondary={
                <Link href="#" underline="hover">
                  @example
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <LinkedInIcon />
            </ListItemIcon>
            <ListItemText
              primary="LinkedIn"
              secondary={
                <Link href="#" underline="hover">
                  linkedin.com/company/example
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <TelegramIcon />
            </ListItemIcon>
            <ListItemText
              primary="Telegram"
              secondary={
                <Link href="#" underline="hover">
                  t.me/example
                </Link>
              }
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default About; 