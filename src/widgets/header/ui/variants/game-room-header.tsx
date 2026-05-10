import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { AppBar, Avatar, Box, ButtonBase, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useMemo, useState, type CSSProperties } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import type {
  GameRoomParticipantSummary,
  RenameRoomParticipantHandler,
  ToggleRoomParticipantSpectatorModeHandler,
} from '@shared/lib';
import { BrandMark } from '@shared/ui/BrandMark';
import { getUserInitials } from '../../model/get-user-initials';
import { useDisplayNameDialog } from '../../model/use-display-name-dialog';
import { useProfileMenu } from '../../model/use-profile-menu';
import { DisplayNameDialog } from '../profile/display-name-dialog';
import styles from '../header.module.css';
import { ProfileMenu } from '../profile/profile-menu';
import { SpectatorModeMenuBlock } from '../profile/spectator-mode-menu-block';
import { ThemeMenu } from '../theme/theme-menu';

type GameRoomHeaderProps = {
  accountLabel: string;
  accountTo: string;
  fallbackParticipantLabel: string;
  headerVars: Record<string, string>;
  isAuthenticated: boolean;
  onRenameRoomParticipant: RenameRoomParticipantHandler;
  onToggleRoomParticipantSpectatorMode: ToggleRoomParticipantSpectatorModeHandler;
  roomTitle: string;
  roomParticipant: GameRoomParticipantSummary | null;
  onOpenInviteDialog: () => void;
  onToggleSidebar: () => void;
  onLeaveRoom: () => void;
  onLogout: () => void;
};

export const GameRoomHeader = ({
  accountLabel,
  accountTo,
  fallbackParticipantLabel,
  headerVars,
  isAuthenticated,
  onRenameRoomParticipant,
  onToggleRoomParticipantSpectatorMode,
  roomTitle,
  roomParticipant,
  onOpenInviteDialog,
  onToggleSidebar,
  onLeaveRoom,
  onLogout,
}: GameRoomHeaderProps) => {
  const [isUpdatingSpectatorMode, setUpdatingSpectatorMode] = useState(false);

  const {
    profileAnchorEl,
    themeAnchorEl,
    currentTheme,
    menuError,
    setMenuError,
    isProfileMenuOpen,
    isThemeMenuOpen,
    handleOpenProfileMenu,
    handleCloseProfileMenu,
    handleOpenThemeMenu,
    handleCloseThemeMenu,
    handleSelectTheme,
  } = useProfileMenu('system');

  const participantLabel = roomParticipant?.displayName || fallbackParticipantLabel;

  const participantCaption = roomParticipant?.isMaster
    ? 'Ведучий'
    : roomParticipant?.isSpectator
      ? 'Спостерігач'
      : 'Учасник';

  const participantInitials = useMemo(
    () => getUserInitials(participantLabel),
    [participantLabel],
  );

  const displayNameDialog = useDisplayNameDialog({
    initialValue: participantLabel,
    requiredMessage: 'Імʼя в кімнаті обовʼязкове.',
    maxLengthMessage: 'Імʼя в кімнаті не має перевищувати 200 символів.',
    fallbackErrorMessage: 'Не вдалося оновити імʼя',
    onSave: async (value) => {
      if (!onRenameRoomParticipant) {
        throw new Error('Не вдалося підготувати оновлення імені.');
      }

      await onRenameRoomParticipant(value);
    },
  });

  const handleToggleSpectatorMode = async (isSpectator: boolean) => {
    if (!onToggleRoomParticipantSpectatorMode) {
      setMenuError('Не вдалося змінити роль учасника.');
      return;
    }

    setUpdatingSpectatorMode(true);
    setMenuError(null);

    try {
      await onToggleRoomParticipantSpectatorMode(isSpectator);
    } catch (error) {
      setMenuError(error instanceof Error ? error.message : 'Не вдалося змінити режим спостерігача');
    } finally {
      setUpdatingSpectatorMode(false);
    }
  };

  const handleLogout = () => {
    handleCloseProfileMenu();
    onLogout();
  };

  return (
    <>
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
              <ButtonBase
                className={styles.roomProfileButton}
                onClick={handleOpenProfileMenu}
                aria-label="Відкрити меню учасника"
              >
                <Avatar className={styles.roomProfileAvatar}>{participantInitials}</Avatar>

                <Stack className={styles.roomProfileText}>
                  <Typography className={styles.roomProfileName}>{participantLabel}</Typography>
                  <Typography className={styles.roomProfileCaption}>{participantCaption}</Typography>
                </Stack>

                <KeyboardArrowDownRoundedIcon className={styles.roomProfileArrow} />
              </ButtonBase>

              <IconButton
                className={styles.roomIconButton}
                onClick={onOpenInviteDialog}
                aria-label="Запросити гравців"
              >
                <PersonAddAlt1RoundedIcon />
              </IconButton>

              <IconButton
                className={styles.roomIconButton}
                onClick={onLeaveRoom}
                aria-label="Вийти з гри"
              >
                <LogoutRoundedIcon />
              </IconButton>

              <IconButton
                className={styles.roomIconButton}
                onClick={onToggleSidebar}
                aria-label="Відкрити бічну панель кімнати"
              >
                <MenuRoundedIcon />
              </IconButton>
            </Stack>
          </Box>
        </Toolbar>
      </AppBar>

      <ProfileMenu
        accountLabel={accountLabel}
        accountTo={accountTo}
        anchorEl={profileAnchorEl}
        errorMessage={menuError}
        isOpen={isProfileMenuOpen}
        label={participantLabel}
        caption={participantCaption}
        initials={participantInitials}
        showLogout={false}
        onClose={handleCloseProfileMenu}
        onEditName={displayNameDialog.open}
        onLogout={handleLogout}
        onNavigateToAccount={handleCloseProfileMenu}
        onOpenThemeMenu={handleOpenThemeMenu}
        extraContent={
          <SpectatorModeMenuBlock
            isSpectator={roomParticipant?.isSpectator ?? false}
            isDisabled={roomParticipant?.isMaster ?? false}
            isPending={isUpdatingSpectatorMode}
            onToggle={handleToggleSpectatorMode}
          />
        }
      />

      <ThemeMenu
        anchorEl={themeAnchorEl}
        isOpen={isThemeMenuOpen}
        currentTheme={currentTheme}
        onClose={handleCloseThemeMenu}
        onSelectTheme={handleSelectTheme}
      />

      <DisplayNameDialog
        title="Змінити імʼя в кімнаті"
        description="Оновіть імʼя, яке бачать інші учасники гри."
        label="Імʼя в кімнаті"
        errorMessage={displayNameDialog.errorMessage}
        isOpen={displayNameDialog.isOpen}
        isSubmitting={displayNameDialog.isSubmitting}
        value={displayNameDialog.value}
        onChange={displayNameDialog.setValue}
        onClose={displayNameDialog.close}
        onSubmit={displayNameDialog.submit}
      />
    </>
  );
};