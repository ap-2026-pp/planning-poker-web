import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box, Typography } from '@mui/material';

import styles from './game-room-surface.module.css';

type RoundStatusLineProps = {
  roundLabel: string;
};

export const RoundStatusLine = ({ roundLabel }: RoundStatusLineProps) => (
  <Box className={styles.roundLine}>
    <span className={styles.roundDot} />
    <Typography className={styles.roundLabel}>{roundLabel}</Typography>
    <InfoOutlinedIcon className={styles.roundIcon} />
  </Box>
);