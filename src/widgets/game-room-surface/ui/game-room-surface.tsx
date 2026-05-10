import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import QuestionMarkRoundedIcon from '@mui/icons-material/QuestionMarkRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import type { Issue } from '@entities/issue';
import { ParticipantRole, type GameParticipant } from '@entities/participant';
import type { PositionedParticipant } from '../../../pages/game-room/model/participant-layout';
import { roleLabels } from '../../../pages/game-room/model/game-room';
import styles from './game-room-surface.module.css';

type GameRoomSurfaceProps = {
  inviteCode: string;
  copiedItem: 'code' | 'invite-link' | null;
  onlineParticipantsCount: number;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  selectedParticipantId: string | null;
  pendingParticipantActionId: string | null;
  votingSystemLabel: string;
  roundLabel: string;
  activeIssue: Issue | null;
  positionedParticipants: PositionedParticipant[];
  overflowParticipants: GameParticipant[];
  deckValues: readonly string[];
  onCopyCode: () => Promise<void>;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
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

type ParticipantActionPanelProps = {
  participant: GameParticipant;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  isPending: boolean;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
};

const ParticipantActionPanel = ({
  participant,
  currentParticipantId,
  isCurrentParticipantMaster,
  isPending,
  onRemoveParticipant,
  onTransferMaster,
}: ParticipantActionPanelProps) => {
  const isSelf = participant.id === currentParticipantId;
  const canManageParticipant = isCurrentParticipantMaster && !isSelf;
  const canTransferMaster = canManageParticipant && participant.role !== ParticipantRole.Spectator;

  if (canManageParticipant) {
    return (
      <Box className={styles.participantActionPanel}>
        {canTransferMaster ? (
          <button
            type="button"
            className={styles.participantActionButton}
            disabled={isPending}
            onClick={(event) => {
              event.stopPropagation();
              void onTransferMaster(participant.id);
            }}
          >
            {isPending ? <CircularProgress size={14} color="inherit" /> : <ShieldRoundedIcon />}
            <span>Передати master</span>
          </button>
        ) : null}

        <button
          type="button"
          className={[styles.participantActionButton, styles.participantActionDanger].join(' ')}
          disabled={isPending}
          onClick={(event) => {
            event.stopPropagation();
            void onRemoveParticipant(participant.id);
          }}
        >
          {isPending ? <CircularProgress size={14} color="inherit" /> : <PersonRemoveRoundedIcon />}
          <span>Видалити</span>
        </button>
      </Box>
    );
  }

  return (
    <Box className={styles.participantHintPanel}>
      {isSelf ? 'Ви' : roleLabels[participant.role]}
    </Box>
  );
};

type ParticipantCardProps = {
  participant: GameParticipant;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  isSelected: boolean;
  isPending: boolean;
  left?: string;
  top?: string;
  compact?: boolean;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
};

const ParticipantCard = ({
  participant,
  currentParticipantId,
  isCurrentParticipantMaster,
  isSelected,
  isPending,
  left,
  top,
  compact = false,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
}: ParticipantCardProps) => (
  <Box
    className={[
      compact ? styles.overflowParticipantCard : styles.participantCard,
      isSelected ? styles.participantCardSelected : '',
    ].join(' ').trim()}
    sx={compact ? undefined : { left, top }}
  >
    {isSelected ? (
      <ParticipantActionPanel
        participant={participant}
        currentParticipantId={currentParticipantId}
        isCurrentParticipantMaster={isCurrentParticipantMaster}
        isPending={isPending}
        onRemoveParticipant={onRemoveParticipant}
        onTransferMaster={onTransferMaster}
      />
    ) : null}

    <button
      type="button"
      className={styles.participantCardButton}
      onClick={() => onParticipantSelect(participant.id)}
    >
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
      <Typography className={styles.participantRole}>
        {participant.role === ParticipantRole.Master ? 'Master'
          : participant.role === ParticipantRole.Player ? 'Player' : 'Spectator'}
      </Typography>
    </button>
  </Box>
);

export const GameRoomSurface = ({
  inviteCode,
  copiedItem,
  onlineParticipantsCount,
  currentParticipantId,
  isCurrentParticipantMaster,
  selectedParticipantId,
  pendingParticipantActionId,
  votingSystemLabel,
  roundLabel,
  activeIssue,
  positionedParticipants,
  overflowParticipants,
  deckValues,
  onCopyCode,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
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
        <ParticipantCard
          key={participant.id}
          participant={participant}
          currentParticipantId={currentParticipantId}
          isCurrentParticipantMaster={isCurrentParticipantMaster}
          isSelected={selectedParticipantId === participant.id}
          isPending={pendingParticipantActionId === participant.id}
          left={left}
          top={top}
          onParticipantSelect={onParticipantSelect}
          onRemoveParticipant={onRemoveParticipant}
          onTransferMaster={onTransferMaster}
        />
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
          <ParticipantCard
            key={participant.id}
            participant={participant}
            currentParticipantId={currentParticipantId}
            isCurrentParticipantMaster={isCurrentParticipantMaster}
            isSelected={selectedParticipantId === participant.id}
            isPending={pendingParticipantActionId === participant.id}
            compact
            onParticipantSelect={onParticipantSelect}
            onRemoveParticipant={onRemoveParticipant}
            onTransferMaster={onTransferMaster}
          />
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
