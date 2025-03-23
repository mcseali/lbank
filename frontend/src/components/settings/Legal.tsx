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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Gavel as GavelIcon,
  Description as DescriptionIcon,
  Security as SecurityIcon,
  PrivacyTip as PrivacyTipIcon,
  Cookie as CookieIcon,
  Copyright as CopyrightIcon,
  Help as HelpIcon,
} from '@mui/icons-material';

const Legal: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {t('legal.title')}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" paragraph>
          {t('legal.description')}
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <GavelIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.terms')}
              secondary={
                <Link href="#" underline="hover">
                  {t('legal.viewTerms')}
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <PrivacyTipIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.privacy')}
              secondary={
                <Link href="#" underline="hover">
                  {t('legal.viewPrivacy')}
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CookieIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.cookies')}
              secondary={
                <Link href="#" underline="hover">
                  {t('legal.viewCookies')}
                </Link>
              }
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CopyrightIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.copyright')}
              secondary={
                <Link href="#" underline="hover">
                  {t('legal.viewCopyright')}
                </Link>
              }
            />
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('legal.faq')}
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('legal.faq1.question')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{t('legal.faq1.answer')}</Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('legal.faq2.question')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{t('legal.faq2.answer')}</Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>{t('legal.faq3.question')}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography>{t('legal.faq3.answer')}</Typography>
          </AccordionDetails>
        </Accordion>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t('legal.contact')}
        </Typography>

        <List>
          <ListItem>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.legalDepartment')}
              secondary="legal@example.com"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <SecurityIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.compliance')}
              secondary="compliance@example.com"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('legal.support')}
              secondary="support@example.com"
            />
          </ListItem>
        </List>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          {t('legal.updates')}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t('legal.lastUpdate')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('legal.updateDescription')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default Legal; 