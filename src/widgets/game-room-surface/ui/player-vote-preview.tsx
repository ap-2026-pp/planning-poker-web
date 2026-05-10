import { Box, Typography } from '@mui/material';

import styles from './game-room-surface.module.css';

export type VotePreviewState = 'empty' | 'hidden' | 'revealed';

type PlayerVotePreviewProps = {
  state: VotePreviewState;
  value?: string | number | null;
};

export const PlayerVotePreview = ({ state, value }: PlayerVotePreviewProps) => (
  <Box className={styles.votePreview}>
    <Box
      className={[
        styles.votePreviewCard,
        state === 'empty' ? styles.votePreviewCardEmpty : '',
        state === 'hidden' ? styles.votePreviewCardHidden : '',
        state === 'revealed' ? styles.votePreviewCardRevealed : '',
      ]
        .join(' ')
        .trim()}
    >
      {state === 'revealed' && value ? (
        <Typography className={styles.votePreviewValue}>{value}</Typography>
      ) : null}
    </Box>
  </Box>
);