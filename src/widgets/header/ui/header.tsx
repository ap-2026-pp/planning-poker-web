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
  const { roomTitle, openInviteDialog, toggleSidebar, leaveRoom } = useGameRoomShell();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === appRoutes.home;
  const isGameRoomPage = isGameRoomRoute(pathname);
  const isHeroPage =
    pathname === appRoutes.home ||
    pathname === appRoutes.login ||
    pathname === appRoutes.register ||
    pathname === appRoutes.joinGame ||
    isGameRoomPage;
  const userInitials = useMemo(() => getUserInitials(user?.email), [user?.email]);
  const headerVars = getHeaderVars(isHeroPage);

  if (isGameRoomPage) {
    return (
      <GameRoomHeader
        headerVars={headerVars}
        roomTitle={roomTitle}
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
          userEmail={user?.email}
          userInitials={userInitials}
          onLogout={logout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      ) : (
        <DefaultHeader
          headerVars={headerVars}
          isAuthenticated={isAuthenticated}
          userEmail={user?.email}
          onLogout={logout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
      )}

      <MobileNavigationDrawer
        open={mobileMenuOpen}
        isHeroPage={isHeroPage}
        isAuthenticated={isAuthenticated}
        userEmail={user?.email}
        userInitials={userInitials}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={logout}
      />
    </>
  );
};
