import { Stack } from '@mui/material';

import type { GameParticipant } from '@entities/participant';
import { ParticipantListItem } from './participant-list-item';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type ParticipantsListProps = {
  participants: GameParticipant[];
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  pendingParticipantActionId: string | null;
  onRequestRemoveParticipant: (participant: GameParticipant) => void;
};

export const ParticipantsList = ({
  participants,
  currentParticipantId,
  isCurrentParticipantMaster,
  pendingParticipantActionId,
  onRequestRemoveParticipant,
}: ParticipantsListProps) => {
  return (
    <Stack className={styles.playerList}>
      {participants.map((participant) => (
        <ParticipantListItem
          key={participant.id}
          participant={participant}
          currentParticipantId={currentParticipantId}
          isCurrentParticipantMaster={isCurrentParticipantMaster}
          isPending={pendingParticipantActionId === participant.id}
          onRequestRemoveParticipant={onRequestRemoveParticipant}
        />
      ))}
    </Stack>
  );
};