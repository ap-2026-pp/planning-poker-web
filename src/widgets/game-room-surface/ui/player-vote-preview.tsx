import { Box } from '@mui/material';

import styles from './game-room-surface.module.css';

type PlayerVotePreviewProps = {
  hasVoted: boolean;
};

export const PlayerVotePreview = ({ hasVoted }: PlayerVotePreviewProps) => (
  <Box className={styles.votePreview}>
    <Box
      className={[
        styles.votePreviewCard,
        hasVoted ? styles.votePreviewCardSelected : styles.votePreviewCardEmpty,
      ].join(' ')}
    />
  </Box>
);