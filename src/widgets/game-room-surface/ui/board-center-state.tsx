import { Box, Typography } from '@mui/material';

import type { RoomRoundResult } from '@entities/game';
import type { Issue } from '@entities/issue';
import styles from './game-room-surface.module.css';

type BoardCenterStateProps = {
  onlineParticipantsCount: number;
  activeIssue: Issue | null;
  votesCastCount: number;
  showRevealButton: boolean;
  canRevealVotes: boolean;
  isRevealSubmitting: boolean;
  isRoundRevealed: boolean;
  roundResult: RoomRoundResult | null;
  showAverage: boolean;
  onRevealVotes: () => Promise<void>;
};

const formatRoundMetric = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

export const BoardCenterState = ({
  onlineParticipantsCount,
  activeIssue,
  votesCastCount,
  showRevealButton,
  canRevealVotes,
  isRevealSubmitting,
  isRoundRevealed,
  roundResult,
  showAverage,
  onRevealVotes,
}: BoardCenterStateProps) => {
  const hasResult = Boolean(roundResult);
  const resultMeta = [
    showAverage && roundResult?.average !== null && roundResult?.average !== undefined
      ? `Середнє: ${formatRoundMetric(roundResult.average)}`
      : null,
    roundResult?.agreement !== null && roundResult?.agreement !== undefined
      ? `Згода: ${formatRoundMetric(roundResult.agreement)}%`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Box className={styles.centerState}>
      <Box className={styles.centerPlatform}>
        <Box className={styles.centerStatusRow}>
          <Typography className={styles.centerMeta}>
            {isRoundRevealed
              ? 'Карти відкрито'
              : votesCastCount
                ? `${votesCastCount} ${votesCastCount === 1 ? 'оцінка отримана' : 'оцінок отримано'}`
                : onlineParticipantsCount
                  ? 'Раунд триває'
                  : 'Кімната очікує гравців'}
          </Typography>
        </Box>

        <Typography className={styles.centerText}>
          {hasResult
            ? 'Фінальна оцінка готова'
            : isRoundRevealed
              ? 'Карти відкрито'
              : activeIssue
                ? 'Очікуємо оцінки гравців...'
                : onlineParticipantsCount
                  ? 'Оберіть активну задачу, щоб почати новий раунд'
                  : 'Очікуємо підключення гравців...'}
        </Typography>

        <Typography className={styles.centerIssue}>
          {activeIssue
            ? `${activeIssue.code ? `${activeIssue.code} · ` : ''}${activeIssue.title}`
            : null}
        </Typography>

        {hasResult ? (
          <Box className={styles.centerResult}>
            <Typography className={styles.centerResultValue}>
              {roundResult?.finalEstimate}
            </Typography>

            {resultMeta ? (
              <Typography className={styles.centerResultMeta}>
                {resultMeta}
              </Typography>
            ) : null}
          </Box>
        ) : null}

        {showRevealButton ? (
          <button
            type="button"
            className={styles.revealVotesButton}
            onClick={() => {
              void onRevealVotes();
            }}
            disabled={!canRevealVotes || isRevealSubmitting}
          >
            {isRevealSubmitting ? 'Відкриваємо...' : 'Відкрити карти'}
          </button>
        ) : null}
      </Box>
    </Box>
  );
};
