import { Box, Typography } from '@mui/material';

import styles from './game-room-surface.module.css';

type VoteDeckProps = {
  deckValues: readonly string[];
};

export const VoteDeck = ({ deckValues }: VoteDeckProps) => (
  <Box className={styles.voteDeck}>
    <Box className={styles.voteDeckGrid}>
      {deckValues.map((value) => (
        <Box key={value} component="button" type="button" className={styles.voteValueCard}>
          {value}
        </Box>
      ))}
    </Box>

    <Typography className={styles.voteHint}>
      Натисніть на картку, щоб зробити оцінку
    </Typography>
  </Box>
);