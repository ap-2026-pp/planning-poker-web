import { Box } from '@mui/material';
import { useState } from 'react';

import type { GameParticipant } from '@entities/participant';
import { ConfirmActionDialog } from '@shared/ui/confirm-action-dialog/confirm-action-dialog';
import { ParticipantsEmptyState } from './participants-empty-state';
import { ParticipantsList } from './participants-list';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type ParticipantsSidebarSectionProps = {
  participants: GameParticipant[];
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  pendingParticipantActionId: string | null;
  onRemoveParticipant: (participantId: string) => Promise<void>;
};

export const ParticipantsSidebarSection = ({
  participants,
  currentParticipantId,
  isCurrentParticipantMaster,
  pendingParticipantActionId,
  onRemoveParticipant,
}: ParticipantsSidebarSectionProps) => {
  const [participantToRemove, setParticipantToRemove] = useState<GameParticipant | null>(null);

  const handleRequestRemoveParticipant = (participant: GameParticipant) => {
    setParticipantToRemove(participant);
  };

  const handleCloseConfirmDialog = () => {
    setParticipantToRemove(null);
  };

  const handleConfirmRemoveParticipant = async () => {
    if (!participantToRemove) {
      return;
    }

    await onRemoveParticipant(participantToRemove.id);
    setParticipantToRemove(null);
  };

  return (
    <Box className={styles.sidebarContent}>
      <Box className={styles.playersScrollArea}>
        {participants.length ? (
          <ParticipantsList
            participants={participants}
            currentParticipantId={currentParticipantId}
            isCurrentParticipantMaster={isCurrentParticipantMaster}
            pendingParticipantActionId={pendingParticipantActionId}
            onRequestRemoveParticipant={handleRequestRemoveParticipant}
          />
        ) : (
          <ParticipantsEmptyState />
        )}
      </Box>

      <ConfirmActionDialog
        open={Boolean(participantToRemove)}
        title="Видалити учасника?"
        description={
          participantToRemove
            ? `Ви впевнені, що хочете видалити ${participantToRemove.displayName} з кімнати?`
            : ''
        }
        confirmLabel="Видалити"
        cancelLabel="Скасувати"
        onClose={handleCloseConfirmDialog}
        onConfirm={() => void handleConfirmRemoveParticipant()}
      />
    </Box>
  );
};