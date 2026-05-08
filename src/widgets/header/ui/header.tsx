import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useSession } from '@shared/auth';
import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import { useGameRoomShell } from '@shared/lib';
import { getHeaderVars } from '../model/header-appearance';
import { getUserInitials } from '../model/get-user-initials';
import { DefaultHeader } from './default-header';
import { GameRoomHeader } from './game-room-header';
import { HeroHeader } from './hero-header';
import { MobileNavigationDrawer } from './mobile-navigation-drawer';

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
  const isGameRoomPage = isGameRoomRoute(pathname);
  const isHeroPage =
    pathname === appRoutes.home ||
    pathname === appRoutes.login ||
    pathname === appRoutes.register ||
    pathname === appRoutes.joinGame ||
    isGameRoomPage;
  const userLabel = user?.displayName || user?.email || 'Акаунт';
  const userInitials = useMemo(
    () => getUserInitials(user?.displayName || user?.email),
    [user?.displayName, user?.email],
  );
  const headerVars = getHeaderVars(isHeroPage);

  if (isGameRoomPage) {
    return (
      <GameRoomHeader
        accountLabel={isAuthenticated ? 'Мій акаунт' : 'Увійти в акаунт'}
        accountTo={isAuthenticated ? appRoutes.account : appRoutes.login}
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
      />
    );
  }

  return (
    <>
      {isHeroPage ? (
        <HeroHeader
          headerVars={headerVars}
          isHomePage={isHomePage}
          isAuthenticated={isAuthenticated}
          userLabel={userLabel}
          userInitials={userInitials}
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
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
      />
    </>
  );
};
