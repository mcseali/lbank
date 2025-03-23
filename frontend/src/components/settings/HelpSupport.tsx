import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
  Divider,
} from '@mui/material';
import { ExpandMore, Email, Help, Support } from '@mui/icons-material';
import { authAPI } from '../../services/api';

const HelpSupport: React.FC = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState<string | false>(false);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authAPI.contactSupport(contactForm);
      setSuccess(t('help.supportRequestSent'));
      setContactForm({ subject: '', message: '' });
    } catch (err: any) {
      setError(err.response?.data?.detail || t('help.supportRequestError'));
    } finally {
      setLoading(false);
    }
  };

  const faqs = [
    {
      question: t('help.faq1.question'),
      answer: t('help.faq1.answer'),
    },
    {
      question: t('help.faq2.question'),
      answer: t('help.faq2.answer'),
    },
    {
      question: t('help.faq3.question'),
      answer: t('help.faq3.answer'),
    },
    {
      question: t('help.faq4.question'),
      answer: t('help.faq4.answer'),
    },
    {
      question: t('help.faq5.question'),
      answer: t('help.faq5.answer'),
    },
  ];

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('help.faq')}
          </Typography>

          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t('help.contactSupport')}
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
            <TextField
              fullWidth
              required
              name="subject"
              label={t('help.subject')}
              value={contactForm.subject}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              required
              name="message"
              label={t('help.message')}
              multiline
              rows={4}
              value={contactForm.message}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Email />}
            >
              {t('help.send')}
            </Button>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              {t('help.otherWays')}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Email />}
              sx={{ mb: 1 }}
              href="mailto:support@example.com"
            >
              {t('help.emailSupport')}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Support />}
              sx={{ mb: 1 }}
              href="https://support.example.com"
              target="_blank"
            >
              {t('help.supportPortal')}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Help />}
              href="https://docs.example.com"
              target="_blank"
            >
              {t('help.documentation')}
            </Button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default HelpSupport; 