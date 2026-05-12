import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { buildAuthRedirectPath, useSession } from '@shared/auth';
import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import { useGameRoomShell } from '@shared/lib';
import { getHeaderVars } from '../model/header-appearance';
import { getUserInitials } from '../model/get-user-initials';
import { DefaultHeader } from './variants/default-header';
import { GameRoomHeader } from './variants/game-room-header';
import { HeroHeader } from './variants/hero-header';
import { MobileNavigationDrawer } from './navigation/mobile-navigation-drawer';

export const Header = () => {
  const { user, isAuthenticated, logout } = useSession();
  const { pathname } = useLocation();

  const {
    roomTitle,
    roomParticipant,
    openInviteDialog,
    toggleSidebar,
    leaveRoom,
    renameRoomParticipant,
    toggleRoomParticipantSpectatorMode,
  } = useGameRoomShell();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHomePage = pathname === appRoutes.home;
  const isMyGamesPage = pathname === appRoutes.myGames;
  const isGameRoomPage = isGameRoomRoute(pathname);
  const isEditGamePage = /^\/games\/[^/]+\/edit$/.test(pathname);

  const isHeroPage =
    pathname === appRoutes.home ||
    pathname === appRoutes.login ||
    pathname === appRoutes.register ||
    pathname === appRoutes.myGames ||
    pathname === appRoutes.createGame ||
    pathname === appRoutes.joinGame ||
    pathname === appRoutes.account ||
    isGameRoomPage ||
    isEditGamePage;

  const userLabel = user?.displayName || user?.email || 'Акаунт';

  const userInitials = useMemo(
    () => getUserInitials(user?.displayName || user?.email),
    [user?.displayName, user?.email],
  );

  const headerVars = getHeaderVars(isHeroPage);

  if (isGameRoomPage) {
    return (
      <GameRoomHeader
        accountLabel={isAuthenticated ? 'Мій акаунт' : 'Привʼязати акаунт'}
        accountTo={isAuthenticated ? appRoutes.account : buildAuthRedirectPath(appRoutes.login, pathname)}
        fallbackParticipantLabel={isAuthenticated ? userLabel : 'Гість'}
        headerVars={headerVars}
        onRenameRoomParticipant={renameRoomParticipant}
        onToggleRoomParticipantSpectatorMode={toggleRoomParticipantSpectatorMode}
        roomTitle={roomTitle}
        roomParticipant={roomParticipant}
        onOpenInviteDialog={openInviteDialog}
        onToggleSidebar={toggleSidebar}
        onLeaveRoom={() => {
          if (leaveRoom) {
            void leaveRoom();
          }
        }}
        onLogout={logout}
      />
    );
  }

  return (
    <>
      {isHeroPage ? (
        <HeroHeader
          headerVars={headerVars}
          isHomePage={isHomePage}
          isMyGamesPage={isMyGamesPage}
          isAuthenticated={isAuthenticated}
          userLabel={userLabel}
          userInitials={userInitials}
          showLogout={isAuthenticated}
          onLogout={logout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      ) : (
        <DefaultHeader
          headerVars={headerVars}
          isAuthenticated={isAuthenticated}
          userLabel={userLabel}
          onLogout={logout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      )}

      <MobileNavigationDrawer
        open={mobileMenuOpen}
        isHeroPage={isHeroPage}
        isAuthenticated={isAuthenticated}
        userLabel={userLabel}
        userInitials={userInitials}
        headerVars={headerVars}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
      />
    </>
  );
};
