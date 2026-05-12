import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { Box, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from './game-room-surface.module.css';

type BoardCenterStateProps = {
  onlineParticipantsCount: number;
  activeIssue: Issue | null;
};

export const BoardCenterState = ({
  onlineParticipantsCount,
  activeIssue,
}: BoardCenterStateProps) => (
  <Box className={styles.centerState}>
    <Box className={styles.centerVisual}>
      <Box className={[styles.centerCard, styles.centerCardBack].join(' ')} />
      <Box className={[styles.centerCard, styles.centerCardFront].join(' ')}>
        <QuestionMarkRoundedIcon className={styles.centerQuestion} />
      </Box>
    </Box>

    <Typography className={styles.centerText}>
      {onlineParticipantsCount ? 'Очікуємо оцінки гравців...' : 'Очікуємо підключення гравців...'}
    </Typography>

    <Typography className={styles.centerIssue}>
      {activeIssue
        ? `${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}`
        : 'Оберіть активну задачу, щоб почати новий раунд'}
    </Typography>
  </Box>
);
