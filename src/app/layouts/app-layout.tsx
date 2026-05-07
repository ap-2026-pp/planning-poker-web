import { Box, Container } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import { GameRoomShellContext, type LeaveRoomHandler } from '@shared/lib';
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isInviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [leaveRoom, setLeaveRoomState] = useState<LeaveRoomHandler>(null);

  useEffect(() => {
    if (!isGameRoomPage) {
      setRoomTitle('Кімната гри');
      setSidebarOpen(false);
      setInviteDialogOpen(false);
      setLeaveRoomState(null);
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

  const gameRoomShellValue = useMemo(
    () => ({
      roomTitle,
      setRoomTitle,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      isInviteDialogOpen,
      openInviteDialog,
      closeInviteDialog,
      leaveRoom,
      setLeaveRoom,
    }),
    [
      roomTitle,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
      isInviteDialogOpen,
      openInviteDialog,
      closeInviteDialog,
      leaveRoom,
      setLeaveRoom,
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
