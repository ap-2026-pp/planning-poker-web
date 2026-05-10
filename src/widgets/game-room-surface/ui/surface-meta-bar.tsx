import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Box } from '@mui/material';

import styles from './game-room-surface.module.css';

type SurfaceMetaBarProps = {
  onlineParticipantsCount: number;
  showSettings: boolean;
  onOpenGameSettings: () => void;
};

export const SurfaceMetaBar = ({
  onlineParticipantsCount,
  showSettings,
  onOpenGameSettings,
}: SurfaceMetaBarProps) => (
  <Box className={styles.surfaceTopBar}>
    <Box className={styles.surfaceMeta}>
      <Box className={styles.metaPill}>
        {onlineParticipantsCount} онлайн
      </Box>

      {showSettings ? (
        <button
          type="button"
          className={styles.settingsPillButton}
          onClick={onOpenGameSettings}
          aria-label="Налаштування гри"
        >
          <SettingsRoundedIcon className={styles.settingsPillIcon} />
          <span>Налаштування</span>
        </button>
      ) : null}
    </Box>
  </Box>
);