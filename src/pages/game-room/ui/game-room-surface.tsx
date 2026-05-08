import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import { Box, Stack, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import type { GameParticipant } from '@entities/participant';
import type { PositionedParticipant } from '../model/participant-layout';
import styles from './game-room-surface.module.css';

type GameRoomSurfaceProps = {
  inviteCode: string;
  copiedItem: 'code' | 'invite-link' | null;
  onlineParticipantsCount: number;
  votingSystemLabel: string;
  roundLabel: string;
  activeIssue: Issue | null;
  positionedParticipants: PositionedParticipant[];
  overflowParticipants: GameParticipant[];
  deckValues: readonly string[];
  onCopyCode: () => Promise<void>;
};

type PlayerVotePreviewProps = {
  hasVoted: boolean;
};

const PlayerVotePreview = ({ hasVoted }: PlayerVotePreviewProps) => (
  <Box className={styles.votePreview}>
    <Box
      className={[
        styles.votePreviewCard,
        hasVoted ? styles.votePreviewCardSelected : styles.votePreviewCardEmpty,
      ].join(' ')}
    />
  </Box>
);

export const GameRoomSurface = ({
  inviteCode,
  copiedItem,
  onlineParticipantsCount,
  votingSystemLabel,
  roundLabel,
  activeIssue,
  positionedParticipants,
  overflowParticipants,
  deckValues,
  onCopyCode,
}: GameRoomSurfaceProps) => (
  <Box className={styles.tableSurface}>
    <Box className={styles.surfaceTopBar}>
      <Stack direction="row" className={styles.surfaceMeta}>
        <button type="button" className={styles.copyMetaButton} onClick={() => void onCopyCode()}>
          {copiedItem === 'code' ? 'Код скопійовано' : `Код: ${inviteCode}`}
        </button>

        <Box className={styles.metaPill}>{onlineParticipantsCount} онлайн</Box>
        <Box className={styles.metaPill}>{votingSystemLabel}</Box>
      </Stack>
    </Box>

    <Box className={styles.roundLine}>
      <span className={styles.roundDot} />
      <Typography className={styles.roundLabel}>{roundLabel}</Typography>
      <InfoOutlinedIcon className={styles.roundIcon} />
    </Box>

    <Box className={styles.boardArena}>
      {positionedParticipants.map(({ participant, left, top }) => (
        <Box key={participant.id} className={styles.participantCard} sx={{ left, top }}>
          <PlayerVotePreview
            hasVoted={Boolean(
              (
                participant as GameParticipant & {
                  voteValue?: string | number | null;
                }
              ).voteValue,
            )}
          />

          <Typography className={styles.participantName}>
            {participant.displayName}
          </Typography>
        </Box>
      ))}

      <Box className={styles.centerState}>
        <Box className={styles.centerVisual}>
          <Box className={[styles.centerCard, styles.centerCardBack].join(' ')} />
          <Box className={[styles.centerCard, styles.centerCardFront].join(' ')} />
          <QuestionMarkRoundedIcon className={styles.centerQuestion} />
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
    </Box>

    {overflowParticipants.length ? (
      <Box className={styles.overflowGrid}>
        {overflowParticipants.map((participant) => (
          <Box key={participant.id} className={styles.overflowParticipant}>
            <Box className={styles.overflowText}>
              <Typography className={styles.overflowName}>
                {participant.displayName}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    ) : null}

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
  </Box>
);
