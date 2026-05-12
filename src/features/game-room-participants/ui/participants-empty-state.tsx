import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import { Box, Typography } from '@mui/material';

import styles from '@shared/ui/game-room-sidebar/game-room-players.module.css';

export const ParticipantsEmptyState = () => {
  return (
    <Box className={styles.playersEmptyState}>
      <Box className={styles.footerIconWrap}>
        <Groups2RoundedIcon className={styles.footerIcon} />
      </Box>

      <Typography className={styles.footerTitle}>Немає учасників</Typography>

      <Typography className={styles.footerDescription}>
        Після приєднання команди гравці з’являться в цій панелі.
      </Typography>
    </Box>
  );
};