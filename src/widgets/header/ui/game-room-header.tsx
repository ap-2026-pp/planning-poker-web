import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { AppBar, Avatar, Box, ButtonBase, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import { useEffect, useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { appRoutes } from '@shared/config/routes';
import type {
  GameRoomParticipantSummary,
  RenameRoomParticipantHandler,
  ToggleRoomParticipantSpectatorModeHandler,
} from '@shared/lib';
import { BrandMark } from '@shared/ui/BrandMark';
import { getUserInitials } from '../model/get-user-initials';
import { GameRoomDisplayNameDialog } from './game-room-display-name-dialog';
import { GameRoomProfileMenu } from './game-room-profile-menu';
import styles from './header.module.css';

type GameRoomHeaderProps = {
  accountLabel: string;
  accountTo: string;
  fallbackParticipantLabel: string;
  headerVars: Record<string, string>;
  onRenameRoomParticipant: RenameRoomParticipantHandler;
  onToggleRoomParticipantSpectatorMode: ToggleRoomParticipantSpectatorModeHandler;
  roomTitle: string;
  roomParticipant: GameRoomParticipantSummary | null;
  onOpenInviteDialog: () => void;
  onToggleSidebar: () => void;
  onLeaveRoom: () => void;
};

export const GameRoomHeader = ({
  accountLabel,
  accountTo,
  fallbackParticipantLabel,
  headerVars,
  onRenameRoomParticipant,
  onToggleRoomParticipantSpectatorMode,
  roomTitle,
  roomParticipant,
  onOpenInviteDialog,
  onToggleSidebar,
  onLeaveRoom,
}: GameRoomHeaderProps) => {
  const [profileAnchorEl, setProfileAnchorEl] = useState<HTMLElement | null>(null);
  const [isDisplayNameDialogOpen, setDisplayNameDialogOpen] = useState(false);
  const [displayNameValue, setDisplayNameValue] = useState('');
  const [displayNameError, setDisplayNameError] = useState<string | null>(null);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [isSavingDisplayName, setSavingDisplayName] = useState(false);
  const [isUpdatingSpectatorMode, setUpdatingSpectatorMode] = useState(false);

  const participantLabel = roomParticipant?.displayName || fallbackParticipantLabel;
  const participantCaption = roomParticipant?.isMaster
    ? 'Ведучий'
    : roomParticipant?.isSpectator
      ? 'Спостерігач'
      : 'Учасник';
  const participantInitials = useMemo(() => getUserInitials(participantLabel), [participantLabel]);

  useEffect(() => {
    setDisplayNameValue(participantLabel);
  }, [participantLabel]);

  const handleOpenProfileMenu = (event: MouseEvent<HTMLElement>) => {
    setMenuError(null);
    setProfileAnchorEl(event.currentTarget);
  };

  const handleCloseProfileMenu = () => {
    setProfileAnchorEl(null);
  };

  const handleOpenDisplayNameDialog = () => {
    setDisplayNameValue(participantLabel);
    setDisplayNameError(null);
    handleCloseProfileMenu();
    setDisplayNameDialogOpen(true);
  };

  const handleCloseDisplayNameDialog = () => {
    setDisplayNameDialogOpen(false);
    setDisplayNameError(null);
  };

  const handleSaveDisplayName = async () => {
    const normalizedValue = displayNameValue.trim();

    if (!normalizedValue) {
      setDisplayNameError('Імʼя в кімнаті обовʼязкове.');
      return;
    }

    if (normalizedValue.length > 200) {
      setDisplayNameError('Імʼя в кімнаті не має перевищувати 200 символів.');
      return;
    }

    if (!onRenameRoomParticipant) {
      setDisplayNameError('Не вдалося підготувати оновлення імені.');
      return;
    }

    setSavingDisplayName(true);
    setDisplayNameError(null);

    try {
      await onRenameRoomParticipant(normalizedValue);
      setDisplayNameDialogOpen(false);
    } catch (error) {
      setDisplayNameError(error instanceof Error ? error.message : 'Не вдалося оновити імʼя');
    } finally {
      setSavingDisplayName(false);
    }
  };

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

      <GameRoomProfileMenu
        accountLabel={accountLabel}
        accountTo={accountTo}
        anchorEl={profileAnchorEl}
        errorMessage={menuError}
        isOpen={Boolean(profileAnchorEl)}
        isSpectator={roomParticipant?.isSpectator ?? false}
        isSpectatorDisabled={roomParticipant?.isMaster ?? false}
        isSpectatorPending={isUpdatingSpectatorMode}
        participantCaption={participantCaption}
        participantInitials={participantInitials}
        participantLabel={participantLabel}
        onClose={handleCloseProfileMenu}
        onEditName={handleOpenDisplayNameDialog}
        onNavigateToAccount={handleCloseProfileMenu}
        onToggleSpectatorMode={handleToggleSpectatorMode}
      />

      <GameRoomDisplayNameDialog
        errorMessage={displayNameError}
        isOpen={isDisplayNameDialogOpen}
        isSubmitting={isSavingDisplayName}
        value={displayNameValue}
        onChange={setDisplayNameValue}
        onClose={handleCloseDisplayNameDialog}
        onSubmit={handleSaveDisplayName}
      />
    </>
  );
};
