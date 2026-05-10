import PersonRemoveRoundedIcon from '@mui/icons-material/PersonRemoveRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import { Box, CircularProgress } from '@mui/material';

import { ParticipantRole, roleLabels, type GameParticipant } from '@entities/participant';
import styles from './game-room-surface.module.css';

type ParticipantActionPanelProps = {
  participant: GameParticipant;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  isPending: boolean;
  onRemoveParticipant: (participantId: string) => Promise<void>;
  onTransferMaster: (participantId: string) => Promise<void>;
};

export const ParticipantActionPanel = ({
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