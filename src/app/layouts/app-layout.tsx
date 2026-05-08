import { Box, Container } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import {
  GameRoomShellContext,
  type GameRoomParticipantSummary,
  type LeaveRoomHandler,
  type RenameRoomParticipantHandler,
  type ToggleRoomParticipantSpectatorModeHandler,
} from '@shared/lib';
import { Header } from '@widgets/header';
import styles from './app-layout.module.css';

export const AppLayout = () => {
  const { pathname } = useLocation();

  const isGameRoomPage = isGameRoomRoute(pathname);
  const isHeroPage =
    pathname === appRoutes.home ||
    pathname === appRoutes.login ||
    pathname === appRoutes.register ||
    pathname === appRoutes.joinGame ||
    isGameRoomPage;

  const [roomTitle, setRoomTitle] = useState('Кімната гри');
  const [roomParticipant, setRoomParticipantState] = useState<GameRoomParticipantSummary | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [leaveRoom, setLeaveRoomState] = useState<LeaveRoomHandler>(null);
  const [renameRoomParticipant, setRenameRoomParticipantState] =
    useState<RenameRoomParticipantHandler>(null);
  const [toggleRoomParticipantSpectatorMode, setToggleRoomParticipantSpectatorModeState] =
    useState<ToggleRoomParticipantSpectatorModeHandler>(null);

  useEffect(() => {
    if (!isGameRoomPage) {
      setRoomTitle('Кімната гри');
      setRoomParticipantState(null);
      setSidebarOpen(false);
      setInviteDialogOpen(false);
      setLeaveRoomState(null);
      setRenameRoomParticipantState(null);
      setToggleRoomParticipantSpectatorModeState(null);
    }
  }, [isGameRoomPage]);

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((currentValue) => !currentValue);
  }, []);

  const openInviteDialog = useCallback(() => {
    setInviteDialogOpen(true);
  }, []);

  const closeInviteDialog = useCallback(() => {
    setInviteDialogOpen(false);
  }, []);

  const setLeaveRoom = useCallback((handler: LeaveRoomHandler) => {
    setLeaveRoomState(() => handler);
  }, []);

  const setRoomParticipant = useCallback((participant: GameRoomParticipantSummary | null) => {
    setRoomParticipantState(participant);
  }, []);

  const setRenameRoomParticipant = useCallback((handler: RenameRoomParticipantHandler) => {
    setRenameRoomParticipantState(() => handler);
  }, []);

  const setToggleRoomParticipantSpectatorMode = useCallback(
    (handler: ToggleRoomParticipantSpectatorModeHandler) => {
      setToggleRoomParticipantSpectatorModeState(() => handler);
    },
    [],
  );

  const gameRoomShellValue = useMemo(
    () => ({
      roomTitle,
      setRoomTitle,
      roomParticipant,
      setRoomParticipant,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      isInviteDialogOpen,
      openInviteDialog,
      closeInviteDialog,
      leaveRoom,
      setLeaveRoom,
      renameRoomParticipant,
      setRenameRoomParticipant,
      toggleRoomParticipantSpectatorMode,
      setToggleRoomParticipantSpectatorMode,
    }),
    [
      roomTitle,
      roomParticipant,
      setRoomParticipant,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      isInviteDialogOpen,
      openInviteDialog,
      closeInviteDialog,
      leaveRoom,
      setLeaveRoom,
      renameRoomParticipant,
      setRenameRoomParticipant,
      toggleRoomParticipantSpectatorMode,
      setToggleRoomParticipantSpectatorMode,
    ]
  );

  return (
    <GameRoomShellContext.Provider value={gameRoomShellValue}>
      <Box
        className={[styles.page, isHeroPage ? styles.pageHome : styles.pageDefault].join(' ')}
      >
        <Box className={[styles.shell, isHeroPage ? styles.shellHome : ''].join(' ').trim()}>
          <Header />

          {isGameRoomPage ? (
            <Box className={styles.gameRoomContent}>
              <Outlet />
            </Box>
          ) : isHeroPage ? (
            <Container maxWidth="xl" className={styles.homeContent}>
              <Outlet />
            </Container>
          ) : (
            <Container maxWidth="xl" className={styles.defaultContent}>
              <Outlet />
            </Container>
          )}
        </Box>
      </Box>
    </GameRoomShellContext.Provider>
  );
};
