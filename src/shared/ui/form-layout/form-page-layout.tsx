import { Box } from '@mui/material';
import type { ReactNode } from 'react';

import styles from './form-layout.module.css';

type FormPageLayoutProps = {
  children: ReactNode;
};

export const FormPageLayout = ({ children }: FormPageLayoutProps) => (
  <Box className={styles.root}>
    <Box className={styles.backdrop} />

    <Box className={styles.cardWrap}>
      <Box className={styles.cardColumn}>{children}</Box>
    </Box>
  </Box>
);