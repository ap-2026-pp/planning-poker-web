import { Box } from '@mui/material';

import { RegisterForm } from './register-form';
import styles from './register-page.module.css';

export const RegisterPage = () => (
  <Box className={styles.root}>
    <Box className={styles.backdrop} />

    <Box className={styles.cardWrap}>
      <Box className={styles.cardColumn}>
        <RegisterForm />
      </Box>
    </Box>
  </Box>
);
