import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { IconButton, Typography, Box } from '@mui/material';

import styles from '@shared/ui/game-room-sidebar/game-room-sidebar.module.css';

type GameRoomSidebarHeaderProps = {
  onClose: () => void;
};

export const GameRoomSidebarHeader = ({ onClose }: GameRoomSidebarHeaderProps) => {
  return (
    <Box className={styles.sidebarHeader}>
      <Typography className={styles.sidebarHeaderTitle}>Панель кімнати</Typography>

      <IconButton
        className={styles.sidebarCloseButton}
        onClick={onClose}
        aria-label="Закрити панель кімнати"
      >
        <CloseRoundedIcon />
      </IconButton>
    </Box>
  );
};