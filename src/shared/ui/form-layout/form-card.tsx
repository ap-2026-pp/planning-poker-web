import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { Alert, Box, IconButton, Stack, Typography } from '@mui/material';
import type { FormEvent, ReactNode } from 'react';

import styles from './form-layout.module.css';

type FormAccent = 'blue' | 'purple' | 'green' | 'orange';

type FormCardProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  icon: ReactNode;
  accent?: FormAccent;
  submitError?: string | null;
  children: ReactNode;
  actions?: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose?: () => void;
};

const cardAccentClassNames: Record<FormAccent, string> = {
  blue: styles.cardAccentBlue,
  purple: styles.cardAccentPurple,
  green: styles.cardAccentGreen,
  orange: styles.cardAccentOrange,
};

const iconAccentClassNames: Record<FormAccent, string> = {
  blue: styles.iconBlue,
  purple: styles.iconPurple,
  green: styles.iconGreen,
  orange: styles.iconOrange,
};

export const FormCard = ({
  title,
  subtitle,
  badge,
  icon,
  accent = 'blue',
  submitError,
  children,
  actions,
  onSubmit,
  onClose,
}: FormCardProps) => (
  <Box className={[styles.card, cardAccentClassNames[accent]].join(' ')}>
    {onClose ? (
      <IconButton
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Закрити форму"
      >
        <CloseRoundedIcon />
      </IconButton>
    ) : null}

    <Stack component="form" className={styles.form} onSubmit={onSubmit}>
      {badge ? <Box className={styles.badge}>{badge}</Box> : null}

      <Stack className={styles.intro}>
        <Box className={[styles.iconShell, iconAccentClassNames[accent]].join(' ')}>
          {icon}
        </Box>

        <Typography className={styles.title}>{title}</Typography>

        {subtitle ? <Typography className={styles.subtitle}>{subtitle}</Typography> : null}
      </Stack>

      {submitError ? (
        <Alert severity="error" className={styles.alert}>
          {submitError}
        </Alert>
      ) : null}

      {children}

      {actions ? <Stack className={styles.actions}>{actions}</Stack> : null}
    </Stack>
  </Box>
);