import { Box, Stack, Switch, Typography } from '@mui/material';

import styles from './profile-menu.module.css';

type SpectatorModeMenuBlockProps = {
  isSpectator: boolean;
  isDisabled: boolean;
  isPending: boolean;
  onToggle: (isSpectator: boolean) => void;
};

export const SpectatorModeMenuBlock = ({
  isSpectator,
  isDisabled,
  isPending,
  onToggle,
}: SpectatorModeMenuBlockProps) => (
  <Box className={styles.switchRow}>
    <Stack className={styles.switchText}>
      <Typography className={styles.switchTitle}>Режим спостерігача</Typography>
      <Typography className={styles.switchHint}>
        {isDisabled
          ? 'Для цього спершу передайте роль ведучого іншому учаснику.'
          : 'У режимі спостерігача можна стежити за грою без голосування.'}
      </Typography>
    </Stack>

    <Switch
      checked={isSpectator}
      disabled={isDisabled || isPending}
      onChange={(_event, checked) => onToggle(checked)}
      className={styles.spectatorSwitch}
    />
  </Box>
);