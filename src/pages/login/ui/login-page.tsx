import { Box } from '@mui/material';

import { LoginForm } from './login-form';
import styles from './login-page.module.css';

export const LoginPage = () => (
  <Box className={styles.root}>
    <Box className={styles.backdrop} />

    <Box className={styles.cardWrap}>
      <Box className={styles.cardColumn}>
        <LoginForm />
      </Box>
    </Box>
  </Box>
);
