import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import { Alert, Avatar, Box, IconButton, Menu, MenuItem, Stack, Switch, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

import styles from './game-room-profile-menu.module.css';

type GameRoomProfileMenuProps = {
  accountLabel: string;
  accountTo: string;
  anchorEl: HTMLElement | null;
  errorMessage: string | null;
  isOpen: boolean;
  isSpectator: boolean;
  isSpectatorDisabled: boolean;
  isSpectatorPending: boolean;
  participantCaption: string;
  participantInitials: string;
  participantLabel: string;
  onClose: () => void;
  onEditName: () => void;
  onNavigateToAccount: () => void;
  onToggleSpectatorMode: (isSpectator: boolean) => void;
};

export const GameRoomProfileMenu = ({
  accountLabel,
  accountTo,
  anchorEl,
  errorMessage,
  isOpen,
  isSpectator,
  isSpectatorDisabled,
  isSpectatorPending,
  participantCaption,
  participantInitials,
  participantLabel,
  onClose,
  onEditName,
  onNavigateToAccount,
  onToggleSpectatorMode,
}: GameRoomProfileMenuProps) => (
  <Menu
    anchorEl={anchorEl}
    open={isOpen}
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    MenuListProps={{ disablePadding: true }}
    PaperProps={{ className: styles.menuPaper }}
  >
    <Stack className={styles.menuContent}>
      <Box className={styles.menuIdentity}>
        <Avatar className={styles.menuAvatar}>{participantInitials}</Avatar>

        <Stack className={styles.menuIdentityText}>
          <Box className={styles.menuNameRow}>
            <Typography className={styles.menuName}>{participantLabel}</Typography>

            <IconButton
              onClick={onEditName}
              className={styles.editButton}
              size="small"
              aria-label="Редагувати ім’я"
            >
              <EditRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography className={styles.menuCaption}>{participantCaption}</Typography>
        </Stack>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Box className={styles.switchRow}>
        <Stack className={styles.switchText}>
          <Typography className={styles.switchTitle}>Режим спостерігача</Typography>
          <Typography className={styles.switchHint}>
            {isSpectatorDisabled
              ? 'Для цього спершу передайте роль ведучого іншому учаснику.'
              : 'У режимі спостерігача можна стежити за грою без голосування.'}
          </Typography>
        </Stack>

        <Switch
          checked={isSpectator}
          disabled={isSpectatorDisabled || isSpectatorPending}
          onChange={(_event, checked) => onToggleSpectatorMode(checked)}
        />
      </Box>

      <MenuItem
        component={RouterLink}
        to={accountTo}
        onClick={onNavigateToAccount}
        className={styles.menuItem}
      >
        <ManageAccountsRoundedIcon fontSize="small" />
        <span>{accountLabel}</span>
      </MenuItem>
    </Stack>
  </Menu>
);