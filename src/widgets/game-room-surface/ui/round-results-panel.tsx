import { Box, Typography } from '@mui/material';
import type { CSSProperties } from 'react';

import type { RoomRoundResult } from '@entities/game';
import type { VoteResult } from '@entities/history';
import styles from './game-room-surface.module.css';

export type VoteDistributionItem = {
  value: string;
  label: string;
  count: number;
};

type RoundResultsPanelProps = {
  distribution: VoteDistributionItem[];
  roundResult: RoomRoundResult | null;
  showAverage: boolean;
  playerResults: VoteResult[];
};

const formatMetric = (value: number) =>
  Number.isInteger(value) ? value.toString() : value.toFixed(1);

const getAgreementLevel = (agreement: number | null | undefined) => {
  if (agreement === null || agreement === undefined) {
    return 'Немає даних';
  }

  if (agreement >= 80) {
    return 'Висока згода';
  }

  if (agreement >= 60) {
    return 'Помірна згода';
  }

  return 'Низька згода';
};

export const RoundResultsPanel = ({
  distribution,
  roundResult,
  showAverage,
  playerResults,
}: RoundResultsPanelProps) => {
  const maxCount = Math.max(...distribution.map((item) => item.count), 1);
  const agreement = roundResult?.agreement ?? null;
  const agreementProgress = Math.max(0, Math.min(100, agreement ?? 0));
  const agreementStyle = {
    '--agreement-progress': `${agreementProgress}%`,
  } as CSSProperties;

  return (
    <Box className={styles.roundSummary}>
      <Box className={styles.roundSummaryDistribution}>
        {distribution.map((item) => {
          const fillHeight = Math.max(18, (item.count / maxCount) * 100);

          return (
            <Box key={item.value} className={styles.roundSummaryBarItem}>
              <Box className={styles.roundSummaryBarTrack}>
                <Box
                  className={styles.roundSummaryBarFill}
                  style={{ height: `${fillHeight}%` }}
                />
              </Box>

              <Box className={styles.roundSummaryVoteCard}>
                <Typography className={styles.roundSummaryVoteValue}>
                  {item.label}
                </Typography>
              </Box>

              <Typography className={styles.roundSummaryVoteCount}>
                {item.count} {item.count === 1 ? 'голос' : 'голоси'}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box className={styles.roundSummaryStats}>
        <Box className={styles.roundSummaryStatCard}>
          <Typography className={styles.roundSummaryStatLabel}>
            Фінальна оцінка
          </Typography>
          <Typography className={styles.roundSummaryStatValue}>
            {roundResult?.finalEstimate ?? '—'}
          </Typography>
        </Box>

        {showAverage ? (
          <Box className={styles.roundSummaryStatCard}>
            <Typography className={styles.roundSummaryStatLabel}>
              Average
            </Typography>
            <Typography className={styles.roundSummaryStatValue}>
              {roundResult?.average !== null && roundResult?.average !== undefined
                ? formatMetric(roundResult.average)
                : '—'}
            </Typography>
          </Box>
        ) : null}

        <Box className={styles.roundSummaryAgreementCard}>
          <Typography className={styles.roundSummaryStatLabel}>
            Agreement
          </Typography>

          <Box className={styles.roundSummaryAgreementGauge} style={agreementStyle}>
            <Box className={styles.roundSummaryAgreementInner}>
              <Typography className={styles.roundSummaryAgreementValue}>
                {agreement !== null && agreement !== undefined
                  ? `${formatMetric(agreement)}%`
                  : '—'}
              </Typography>
            </Box>
          </Box>

          <Typography className={styles.roundSummaryAgreementLabel}>
            {getAgreementLevel(agreement)}
          </Typography>
        </Box>
      </Box>

      <Box className={styles.roundSummaryVotes}>
        <Typography className={styles.roundSummaryVotesTitle}>
          Хто за що проголосував
        </Typography>

        <Box className={styles.roundSummaryVotesList}>
          {playerResults.map((playerResult) => (
            <Box
              key={`${playerResult.participantId}-${playerResult.voteValue}`}
              className={styles.roundSummaryVoteRow}
            >
              <Typography className={styles.roundSummaryVoteName}>
                {playerResult.displayName}
              </Typography>

              <Box className={styles.roundSummaryVoteBadge}>
                <Typography className={styles.roundSummaryVoteBadgeValue}>
                  {playerResult.voteValue === 'coffee' ? '☕' : playerResult.voteValue}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
