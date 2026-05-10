import { Box, Typography } from '@mui/material';

import { ParticipantRole, type GameParticipant } from '@entities/participant';
import { ParticipantActionPanel } from './participant-action-panel';
import { PlayerVotePreview } from './player-vote-preview';
import styles from './game-room-surface.module.css';

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

export const ParticipantCard = ({
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
    ]
      .join(' ')
      .trim()}
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
        {participant.role === ParticipantRole.Master
          ? 'Master'
          : participant.role === ParticipantRole.Player
            ? 'Player'
            : 'Spectator'}
      </Typography>
    </button>
  </Box>
);