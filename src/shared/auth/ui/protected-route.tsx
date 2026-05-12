import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { appRoutes, isGameRoomRoute } from '@shared/config/routes';
import {
  buildAuthRedirectPath,
  buildSessionExpiredRedirectPath,
  hasGuestTokenCookie,
  useSession,
} from '@shared/auth';

type ProtectedRouteProps = {
  children: ReactNode;
  allowGuest?: boolean;
};

export const ProtectedRoute = ({ children, allowGuest = false }: ProtectedRouteProps) => {
  const { status, isAuthenticated, hasGuestAccess, expiredSessionEmail } = useSession();
  const location = useLocation();
  const canUseGuestAccess = allowGuest && (hasGuestAccess || hasGuestTokenCookie());

  if (status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!isAuthenticated && !canUseGuestAccess) {
    const returnTo = `${location.pathname}${location.search}`;
    const redirectTo = isGameRoomRoute(location.pathname)
      ? buildSessionExpiredRedirectPath(appRoutes.login, returnTo, expiredSessionEmail)
      : buildAuthRedirectPath(appRoutes.login, returnTo);

    return (
      <Navigate
        to={redirectTo}
        replace
      />
    );
  }

  return <>{children}</>;
};
