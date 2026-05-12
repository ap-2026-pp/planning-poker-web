import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

import { appRoutes } from '@shared/config/routes';
import { buildAuthRedirectPath, useSession } from '@shared/auth';

type ProtectedRouteProps = {
  children: ReactNode;
};

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status, isAuthenticated } = useSession();
  const location = useLocation();

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

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={buildAuthRedirectPath(appRoutes.login, returnTo)}
        replace
      />
    );
  }

  return <>{children}</>;
};