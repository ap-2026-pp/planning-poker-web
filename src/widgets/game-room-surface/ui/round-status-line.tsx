import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Typography } from '@mui/material';

import styles from './game-room-surface.module.css';

type RoundStatusLineProps = {
  roundLabel: string;
  issueToneIndex?: number | null;
};

export const RoundStatusLine = ({
  roundLabel,
  issueToneIndex = null,
}: RoundStatusLineProps) => (
  <Box className={styles.roundLine}>
    <span
      className={[
        styles.roundDot,
        issueToneIndex !== null ? styles[`roundDotTone${issueToneIndex}`] : '',
        styles.roundDotWaiting,
      ].join(' ').trim()}
    />
    <Typography className={styles.roundLabel}>{roundLabel}</Typography>
    <InfoOutlinedIcon className={styles.roundIcon} />
  </Box>
);
