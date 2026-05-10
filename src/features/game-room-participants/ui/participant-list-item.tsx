import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { Box, IconButton, Stack, Typography } from '@mui/material';

import {
  getParticipantInitials,
  isParticipantOnline,
  roleLabels,
  type GameParticipant,
} from '@entities/participant';
import styles from '@widgets/game-room-sidebar/ui/game-room-sidebar.module.css';

type ParticipantListItemProps = {
  participant: GameParticipant;
  currentParticipantId: string | null;
  isCurrentParticipantMaster: boolean;
  isPending: boolean;
  onRequestRemoveParticipant: (participant: GameParticipant) => void;
};

export const ParticipantListItem = ({
  participant,
  currentParticipantId,
  isCurrentParticipantMaster,
  isPending,
  onRequestRemoveParticipant,
}: ParticipantListItemProps) => {
  const isOnline = isParticipantOnline(participant);
  const isSelf = participant.id === currentParticipantId;
  const canRemoveParticipant = isCurrentParticipantMaster && !isSelf;

  return (
    <Box
      className={[
        styles.playerListItem,
        !isOnline ? styles.playerListItemOffline : '',
      ].join(' ').trim()}
    >
      <Stack direction="row" className={styles.playerListRow}>
        <Stack direction="row" className={styles.playerIdentity}>
          <Box className={styles.playerPresenceWrap}>
            <span
              className={[
                styles.playerPresence,
                isOnline
                  ? styles.playerPresenceOnline
                  : styles.playerPresenceOffline,
              ].join(' ').trim()}
            />

            <Box className={styles.playerListAvatar}>
              {getParticipantInitials(participant.displayName)}
            </Box>
          </Box>

          <Stack className={styles.playerListText}>
            <Typography className={styles.playerListName}>
              {participant.displayName}
              {isSelf ? ' · Ви' : ''}
            </Typography>

            <Typography className={styles.playerListRole}>
              {roleLabels[participant.role]} · {isOnline ? 'онлайн' : 'офлайн'}
            </Typography>
          </Stack>
        </Stack>

        {canRemoveParticipant ? (
          <IconButton
            className={styles.playerRemoveButton}
            disabled={isPending}
            onClick={() => onRequestRemoveParticipant(participant)}
            aria-label={`Видалити ${participant.displayName}`}
          >
            <DeleteOutlineRoundedIcon fontSize="small" />
          </IconButton>
        ) : null}
      </Stack>
    </Box>
  );
};