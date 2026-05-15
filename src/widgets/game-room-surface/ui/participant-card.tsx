import { Box, Typography } from '@mui/material';

import { ParticipantRole, type GameParticipant } from '@entities/participant';
import { ParticipantActionPanel } from './participant-action-panel';
import { PlayerVotePreview } from './player-vote-preview';
import styles from './game-room-surface.module.css';

type ParticipantCardProps = {
  participant: GameParticipant;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  enableFunFeatures: boolean;
  isSelected: boolean;
  isPending: boolean;
  left?: string;
  top?: string;
  compact?: boolean;
  onRegisterCardElement: (participantId: string, element: HTMLButtonElement | null) => void;
  onParticipantSelect: (participantId: string) => void;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
  onSendEmojiReaction: (participantId: string, emoji: string) => Promise<void>;
};

export const ParticipantCard = ({
  participant,
  currentParticipantId,
  isCurrentParticipantMaster,
  enableFunFeatures,
  isSelected,
  isPending,
  left,
  top,
  compact = false,
  onRegisterCardElement,
  onParticipantSelect,
  onRemoveParticipant,
  onTransferMaster,
  onSendEmojiReaction,
}: ParticipantCardProps) => {
  const voteValue = participant.voteValue ?? null;
  const hasVoted = participant.hasVoted ?? Boolean(voteValue);
  const votePreviewState = hasVoted ? (voteValue ? 'revealed' : 'hidden') : 'empty';
  const previewValue = voteValue === 'coffee' ? '☕' : voteValue;
  const canSendEmoji = enableFunFeatures && Boolean(currentParticipantId) && participant.id !== currentParticipantId;

  return (
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
          canSendEmoji={canSendEmoji}
          isPending={isPending}
          onRemoveParticipant={onRemoveParticipant}
          onTransferMaster={onTransferMaster}
          onSendEmoji={onSendEmojiReaction}
        />
      ) : null}

      <button
        type="button"
        ref={(element) => onRegisterCardElement(participant.id, element)}
        className={styles.participantCardButton}
        onClick={() => onParticipantSelect(participant.id)}
      >
        <PlayerVotePreview state={votePreviewState} value={previewValue} />

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
};
