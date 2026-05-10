import { Alert, Box, Stack, Typography } from '@mui/material';
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
};

const accentClassNames: Record<FormAccent, string> = {
  blue: styles.accentBlue,
  purple: styles.accentPurple,
  green: styles.accentGreen,
  orange: styles.accentOrange,
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
}: FormCardProps) => (
  <Box className={styles.card}>
    <Stack component="form" className={styles.form} onSubmit={onSubmit}>
      {badge ? <Box className={styles.badge}>{badge}</Box> : null}

      <Stack className={styles.intro}>
        <Box className={[styles.iconShell, accentClassNames[accent]].join(' ')}>
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