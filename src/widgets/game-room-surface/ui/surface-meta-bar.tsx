import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import { Box } from '@mui/material';
import type { MouseEvent } from 'react';

import styles from './game-room-surface.module.css';

type SurfaceMetaBarProps = {
  onlineParticipantsCount: number;
  showSettings: boolean;
  canManageTimer: boolean;
  timerLabel: string;
  isTimerActive: boolean;
  onOpenTimerMenu: (event: MouseEvent<HTMLButtonElement>) => void;
  onOpenGameSettings: () => void;
};

export const SurfaceMetaBar = ({
  onlineParticipantsCount,
  showSettings,
  canManageTimer,
  timerLabel,
  isTimerActive,
  onOpenTimerMenu,
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

      {canManageTimer ? (
        <button
          type="button"
          className={[
            styles.timerPillButton,
            isTimerActive ? styles.timerPillButtonActive : '',
          ].join(' ').trim()}
          onClick={onOpenTimerMenu}
          aria-label="Налаштувати таймер"
        >
          <AccessTimeRoundedIcon className={styles.settingsPillIcon} />
          <span>{timerLabel}</span>
        </button>
      ) : (
        <Box
          className={[
            styles.timerPillButton,
            isTimerActive ? styles.timerPillButtonActive : '',
          ].join(' ').trim()}
        >
          <AccessTimeRoundedIcon className={styles.settingsPillIcon} />
          <span>{timerLabel}</span>
        </Box>
      )}
    </Box>
  </Box>
);
