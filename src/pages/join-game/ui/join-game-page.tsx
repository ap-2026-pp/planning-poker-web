import { Box } from '@mui/material';

import { JoinGameForm } from './join-game-form';
import styles from './join-game-page.module.css';

export const JoinGamePage = () => (
  <Box className={styles.root}>
    <Box className={styles.backdrop} />

    <Box className={styles.cardWrap}>
      <Box className={styles.cardColumn}>
        <JoinGameForm />
      </Box>
    </Box>
  </Box>
);
