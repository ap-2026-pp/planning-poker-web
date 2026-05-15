import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import ManageAccountsRoundedIcon from '@mui/icons-material/ManageAccountsRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

import styles from './profile-menu.module.css';

type ProfileMenuProps = {
  accountLabel: string;
  accountTo: string;
  anchorEl: HTMLElement | null;
  errorMessage: string | null;
  isOpen: boolean;
  label: string;
  caption: string;
  initials: string;
  showLogout: boolean;
  extraContent?: ReactNode;
  openAccountAsDialog?: boolean;

  onClose: () => void;
  onEditName: () => void;
  onLogout: () => void;
  onNavigateToAccount: () => void;
  onOpenThemeMenu: () => void;
};

export const ProfileMenu = ({
  accountLabel,
  accountTo,
  anchorEl,
  errorMessage,
  isOpen,
  label,
  caption,
  initials,
  showLogout,
  extraContent,
  openAccountAsDialog = false,
  onClose,
  onEditName,
  onLogout,
  onNavigateToAccount,
  onOpenThemeMenu,
}: ProfileMenuProps) => {
  const { pathname, search } = useLocation();
  const currentPath = `${pathname}${search}`;

  const handleAccountClick = () => {
    onClose();

    if (openAccountAsDialog) {
      onNavigateToAccount();
    }
  };

  return (
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
          <Avatar className={styles.menuAvatar}>{initials}</Avatar>

          <Stack className={styles.menuIdentityText}>
            <Box className={styles.menuNameRow}>
              <Typography className={styles.menuName}>{label}</Typography>

              <IconButton
                onClick={onEditName}
                className={styles.editButton}
                size="small"
                aria-label="Редагувати імʼя"
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <Typography className={styles.menuCaption}>{caption}</Typography>
          </Stack>
        </Box>

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {extraContent}

        {openAccountAsDialog ? (
          <MenuItem onClick={handleAccountClick} className={styles.menuItem}>
            <ManageAccountsRoundedIcon fontSize="small" />
            <span>{accountLabel}</span>
          </MenuItem>
        ) : (
          <MenuItem
            component={RouterLink}
            to={accountTo}
            state={{ from: currentPath }}
            onClick={handleAccountClick}
            className={styles.menuItem}
          >
            <ManageAccountsRoundedIcon fontSize="small" />
            <span>{accountLabel}</span>
          </MenuItem>
        )}

        <MenuItem onClick={onOpenThemeMenu} className={styles.menuItem}>
          <PaletteRoundedIcon fontSize="small" />
          <span>Вигляд</span>
        </MenuItem>

        {showLogout ? (
          <MenuItem
            onClick={onLogout}
            className={[styles.menuItem, styles.menuItemDanger].join(' ')}
          >
            <LogoutRoundedIcon fontSize="small" />
            <span>Вийти з акаунта</span>
          </MenuItem>
        ) : null}
      </Stack>
    </Menu>
  );
};
