import { Box, Stack } from '@mui/material';

import styles from './game-room-surface.module.css';

type SurfaceMetaBarProps = {
  inviteCode: string;
  copiedItem: 'code' | 'invite-link' | null;
  onlineParticipantsCount: number;
  votingSystemLabel: string;
  onCopyCode: () => Promise<void>;
};

export const SurfaceMetaBar = ({
  inviteCode,
  copiedItem,
  onlineParticipantsCount,
  votingSystemLabel,
  onCopyCode,
}: SurfaceMetaBarProps) => (
  <Box className={styles.surfaceTopBar}>
    <Stack direction="row" className={styles.surfaceMeta}>
      <button type="button" className={styles.copyMetaButton} onClick={() => void onCopyCode()}>
        {copiedItem === 'code' ? 'Код скопійовано' : `Код: ${inviteCode}`}
      </button>

      <Box className={styles.metaPill}>{onlineParticipantsCount} онлайн</Box>
      <Box className={styles.metaPill}>{votingSystemLabel}</Box>
    </Stack>
  </Box>
);