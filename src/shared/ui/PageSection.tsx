import type { PropsWithChildren, ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import styles from './page-section.module.css';

type PageSectionProps = PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}>;

export const PageSection = ({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageSectionProps) => (
  <Stack className={styles.root}>
    <Stack className={styles.header}>
      <Box className={styles.content}>
        {eyebrow ? (
          <Typography variant="caption" className={styles.eyebrow}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h2" className={styles.title}>
          {title}
        </Typography>
        {description ? (
          <Typography variant="body1" color="text.secondary" className={styles.description}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {actions}
    </Stack>

    {children}
  </Stack>
);
