import { Box, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import styles from './game-room-surface.module.css';

type BoardCenterStateProps = {
  onlineParticipantsCount: number;
  activeIssue: Issue | null;
  votesCastCount: number;
  canRevealVotes: boolean;
  onRevealVotes: () => void;
};

export const BoardCenterState = ({
  onlineParticipantsCount,
  activeIssue,
  votesCastCount,
  canRevealVotes,
  onRevealVotes,
}: BoardCenterStateProps) => (
  <Box className={styles.centerState}>
    <Box className={styles.centerPlatform}>
      <Box className={styles.centerStatusRow}>
        <Typography className={styles.centerMeta}>
          {votesCastCount
            ? `${votesCastCount} ${votesCastCount === 1 ? 'оцінка отримана' : 'оцінок отримано'}`
            : onlineParticipantsCount
              ? 'Раунд триває'
              : 'Кімната очікує гравців'}
        </Typography>
      </Box>

      <Typography className={styles.centerText}>
        {onlineParticipantsCount ? 'Очікуємо оцінки гравців...' : 'Очікуємо підключення гравців...'}
      </Typography>

      <Typography className={styles.centerIssue}>
        {activeIssue
          ? `${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}`
          : 'Оберіть активну задачу, щоб почати новий раунд'}
      </Typography>

      {canRevealVotes ? (
        <button
          type="button"
          className={styles.revealVotesButton}
          onClick={onRevealVotes}
        >
          Відкрити карти
        </button>
      ) : null}
    </Box>
  </Box>
);
