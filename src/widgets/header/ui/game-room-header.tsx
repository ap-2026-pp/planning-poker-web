import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { AppBar, Box, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import type { CSSProperties } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import { BrandMark } from '@shared/ui/BrandMark';
import styles from './header.module.css';

type GameRoomHeaderProps = {
  headerVars: Record<string, string>;
  roomTitle: string;
  onOpenInviteDialog: () => void;
  onToggleSidebar: () => void;
  onLeaveRoom: () => void;
};

export const GameRoomHeader = ({
  headerVars,
  roomTitle,
  onOpenInviteDialog,
  onToggleSidebar,
  onLeaveRoom,
}: GameRoomHeaderProps) => (
  <AppBar
    position="static"
    color="transparent"
    elevation={0}
    className={styles.header}
    style={headerVars as CSSProperties}
  >
    <Toolbar className={styles.toolbar}>
      <Box className={styles.gameRoomContainer}>
        <Box className={styles.gameRoomLeft}>
          <Box component={RouterLink} to={appRoutes.home} className={styles.brandLink}>
            <BrandMark inverse />
          </Box>
        </Box>

        <Typography className={styles.gameRoomTitle}>{roomTitle}</Typography>

        <Stack direction="row" className={styles.gameRoomActions}>
          <Button variant="contained" onClick={onOpenInviteDialog} className={styles.roomInviteButton}>
            Запросити гравців
          </Button>

          <IconButton
            className={styles.roomSidebarButton}
            onClick={onToggleSidebar}
            aria-label="Open room sidebar"
          >
            <MenuRoundedIcon />
          </IconButton>

          <Button
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={onLeaveRoom}
            className={styles.roomLeaveButton}
          >
            Вийти з гри
          </Button>
        </Stack>
      </Box>
    </Toolbar>
  </AppBar>
);
